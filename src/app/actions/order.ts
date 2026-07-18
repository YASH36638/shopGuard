'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createOrderAction(data: {
  totalAmount: number;
  grossProfit: number;
  hamaliCollected: number;
  freightCollected: number;
  revenueDuring: number;
  revenueAfter: number;
  profitDuring: number;
  profitAfter: number;
  paymentMethod: string;
}) {
  try {
    const order = await prisma.order.create({
      data: {
        totalAmount: data.totalAmount,
        grossProfit: data.grossProfit,
        hamaliCollected: data.hamaliCollected,
        freightCollected: data.freightCollected,
        revenueDuring: data.revenueDuring,
        revenueAfter: data.revenueAfter,
        profitDuring: data.profitDuring,
        profitAfter: data.profitAfter,
        status: 'DISPATCHED',
        paymentMethod: data.paymentMethod,
      }
    });
    
    // Automatically add gross profit to working capital
    const config = await prisma.storeConfig.findUnique({ where: { id: 'singleton' } });
    if (config) {
      await prisma.storeConfig.update({
        where: { id: 'singleton' },
        data: { workingCapital: { increment: data.grossProfit } }
      });
    } else {
      await prisma.storeConfig.create({
        data: {
          id: 'singleton',
          workingCapital: 315000 + data.grossProfit,
          protectedFloor: 315000
        }
      });
    }
    
    revalidatePath('/ledger');
    revalidatePath('/');
    
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: 'Failed to save order' };
  }
}

export async function settleCreditOrder(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const paymentMethod = formData.get('paymentMethod') as string;

  if (!orderId || !paymentMethod) return;

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentMethod, status: 'PAID_READY' } // Marking as PAID_READY or DISPATCHED depending on convention. We'll just leave it DISPATCHED or SETTLED.
  });

  revalidatePath('/ledger');
}
