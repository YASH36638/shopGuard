'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Fetch the global config or initialize it if it doesn't exist
export async function getStoreConfig() {
  let config = await prisma.storeConfig.findUnique({ where: { id: 'singleton' } });
  if (!config) {
    config = await prisma.storeConfig.create({
      data: {
        id: 'singleton',
        workingCapital: 315000,
        protectedFloor: 315000,
      }
    });
  }
  return config;
}

export async function updateWorkingCapital(amount: number) {
  await prisma.storeConfig.update({
    where: { id: 'singleton' },
    data: { workingCapital: amount }
  });
  revalidatePath('/');
}

// Fetch all orders for today to calculate real daily profit
export async function getTodayStats() {
  const now = new Date();
  const istDateString = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const [month, day, year] = istDateString.split('/');
  const startOfDay = new Date(`${year}-${month}-${day}T00:00:00+05:30`);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfDay }
    }
  });

  const totalGrossProfit = orders.reduce((sum, order) => sum + order.grossProfit, 0);
  const totalHamali = orders.reduce((sum, order) => sum + order.hamaliCollected, 0);
  const totalFreight = orders.reduce((sum, order) => sum + order.freightCollected, 0);
  const totalOrders = orders.length;

  return { totalGrossProfit, totalHamali, totalFreight, totalOrders };
}

// Fetch or create a default supplier for the icebox
export async function getSupplier(supplierName: string) {
  let supplier = await prisma.supplier.findFirst({
    where: { name: supplierName }
  });

  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        name: supplierName,
        legacyDebt: 250000,
        isFrozen: supplierName === 'Supplier 1'
      }
    });
  }
  return supplier;
}

export async function updateSupplierDebt(supplierId: string, newDebt: number) {
  await prisma.supplier.update({
    where: { id: supplierId },
    data: { legacyDebt: newDebt }
  });
  revalidatePath('/legacy');
}

export async function updateSupplierActiveCredit(supplierId: string, newCredit: number) {
  await prisma.supplier.update({
    where: { id: supplierId },
    data: { activeCredit: newCredit }
  });
  revalidatePath('/legacy');
}

// Drip Feed Operations
export async function updateStoreConfig(data: Partial<{
  survivalTarget: number;
  basePendingBags: number;
  legacyLoss: number;
}>) {
  await prisma.storeConfig.update({
    where: { id: 'singleton' },
    data
  });
  revalidatePath('/');
  revalidatePath('/legacy');
}

export async function getDripFeedStats() {
  const logs = await prisma.dripFeedLog.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  const config = await prisma.storeConfig.findUnique({ where: { id: 'singleton' } });
  
  const accruedLoss = logs.reduce((sum, log) => {
    const loss = ((log.bookedRate || 0) - log.rate) * log.bags;
    return sum + (loss > 0 ? loss : 0);
  }, 0);

  const totalLoss = (config?.legacyLoss || 0) + accruedLoss;

  return { logs, totalLoss, basePendingBags: config?.basePendingBags || 750 };
}

export async function logDripFeedDispatch(bags: number, rate: number, bookedRate: number) {
  await prisma.dripFeedLog.create({
    data: { bags, rate, bookedRate }
  });

  const loss = (bookedRate - rate) * bags;
  if (loss > 0) {
    await prisma.storeConfig.update({
      where: { id: 'singleton' },
      data: { workingCapital: { decrement: loss } }
    });
  }

  revalidatePath('/legacy');
  revalidatePath('/'); // Update working capital on dashboard
}
