'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  try {
    return await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function createProductAction(data: {
  name: string;
  type: string;
  phase: string;
  baseCost: number;
  standardMargin: number;
  hamaliRate: number;
}) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        type: data.type,
        phase: data.phase,
        baseCost: data.baseCost,
        standardMargin: data.standardMargin,
        hamaliRate: data.hamaliRate,
      }
    });
    
    revalidatePath('/pos');
    return { success: true, product };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: 'Failed to save product' };
  }
}
