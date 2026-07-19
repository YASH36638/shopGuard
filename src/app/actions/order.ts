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
  customerId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    baseCost: number;
    standardMargin: number;
    hamaliRate: number;
    cashRate: number;
    phase: string;
  }>;
}) {
  try {
    const order = await prisma.order.create({
      data: {
        customer: data.customerId ? { connect: { id: data.customerId } } : undefined,
        totalAmount: data.totalAmount,
        grossProfit: data.grossProfit,
        hamaliCollected: data.hamaliCollected,
        freightCollected: data.freightCollected,
        revenueDuring: data.revenueDuring,
        revenueAfter: data.revenueAfter,
        profitDuring: data.profitDuring,
        profitAfter: data.profitAfter,
        status: data.paymentMethod === 'CREDIT' ? 'CREDIT' : 'DISPATCHED',
        paymentMethod: data.paymentMethod,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            baseCost: item.baseCost,
            standardMargin: item.standardMargin,
            hamaliRate: item.hamaliRate,
            cashRate: item.cashRate,
            phase: item.phase
          }))
        }
      }
    });

    if (data.paymentMethod !== 'CREDIT') {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: data.totalAmount,
          method: data.paymentMethod
        }
      });
    }

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
    if (data.customerId) revalidatePath(`/customer/${data.customerId}`);
    revalidatePath('/');
    
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: 'Failed to save order' };
  }
}

export async function processPayment(orderId: string, amount: number, method: string) {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payments: true } });
    if (!order) return { success: false, error: 'Order not found' };

    await prisma.payment.create({
      data: { orderId, amount, method }
    });

    const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0) + amount;
    
    if (totalPaid >= order.totalAmount) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'DISPATCHED' }
      });
    }

    revalidatePath(`/order/${orderId}`);
    revalidatePath('/ledger');
    return { success: true };
  } catch (error) {
    console.error('Payment error:', error);
    return { success: false, error: 'Failed to process payment' };
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
