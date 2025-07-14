/**
 * Utility functions for converting decimal strings to numbers
 * TypeORM returns decimal columns as strings, but we need numbers for calculations
 */

export function convertDecimalToNumber(value: any): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    return parseFloat(value);
  }
  return 0;
}

export function convertProductPrices<T extends { price: any; weight?: any }>(product: T): T {
  return {
    ...product,
    price: convertDecimalToNumber(product.price),
    ...(product.weight !== undefined && { weight: convertDecimalToNumber(product.weight) }),
  };
}

export function convertOrderAmounts<T extends { totalAmount: any }>(order: T): T {
  return {
    ...order,
    totalAmount: convertDecimalToNumber(order.totalAmount),
  };
}

export function convertOrderItemPrices<T extends { price: any }>(orderItem: T): T {
  return {
    ...orderItem,
    price: convertDecimalToNumber(orderItem.price),
  };
}