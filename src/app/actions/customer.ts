'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getCustomers() {
  try {
    return await prisma.customer.findMany({
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error('Failed to get customers:', error);
    return [];
  }
}

export async function createCustomer(name: string, phone: string | null) {
  try {
    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
      }
    });
    revalidatePath('/pos');
    return { success: true, customer };
  } catch (error) {
    console.error('Failed to create customer:', error);
    return { success: false, error };
  }
}

export async function getCustomerDetails(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: true,
            payments: true
          },
          orderBy: { createdAt: 'desc' }
        },
        returns: {
          include: {
            product: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    return { success: true, customer };
  } catch (error) {
    console.error('Failed to get customer details:', error);
    return { success: false, error };
  }
}

export async function processReturn(customerId: string, orderId: string | null, productId: string, quantity: number, refundValue: number) {
  try {
    const ret = await prisma.return.create({
      data: {
        customerId,
        orderId,
        productId,
        quantity,
        refundValue
      }
    });
    
    if (orderId) {
      const orderItem = await prisma.orderItem.findFirst({
        where: { orderId, productId }
      });

      if (orderItem) {
        const profitToReverse = orderItem.standardMargin * quantity;
        
        const updateData: any = {
          grossProfit: { decrement: profitToReverse },
        };
        
        if (orderItem.phase === 'DURING') {
          updateData.profitDuring = { decrement: profitToReverse };
        } else {
          updateData.profitAfter = { decrement: profitToReverse };
        }

        await prisma.order.update({
          where: { id: orderId },
          data: updateData
        });

        await prisma.storeConfig.update({
          where: { id: 'singleton' },
          data: { workingCapital: { decrement: profitToReverse } }
        });
      }
    } else {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (product) {
        const profitToReverse = product.standardMargin * quantity;
        await prisma.storeConfig.update({
          where: { id: 'singleton' },
          data: { workingCapital: { decrement: profitToReverse } }
        });
      }
    }
    
    revalidatePath(`/customer/${customerId}`);
    revalidatePath('/ledger');
    if (orderId) revalidatePath(`/order/${orderId}`);
    return { success: true, return: ret };
  } catch (error) {
    console.error('Failed to process return:', error);
    return { success: false, error };
  }
}
