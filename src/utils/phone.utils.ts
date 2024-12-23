export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters except the initial +
  const cleaned = phone.startsWith('+') 
    ? phone.substring(1).replace(/\D/g, '')
    : phone.replace(/\D/g, '');
  return `${cleaned}@c.us`;
}

export function isBusinessNumber(phoneNumber: string, businessNumber: string): boolean {
  // Remove all non-numeric characters for comparison
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const cleanBusiness = businessNumber.replace(/\D/g, '');
  return cleanPhone === cleanBusiness;
}