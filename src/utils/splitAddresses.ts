type AddressBase = {
  addressType: 'FROM' | 'TO';
};

export default function splitAddresses<T extends AddressBase>(addresses: T[]) {
  const from = addresses.find((a) => a.addressType === 'FROM');
  const to = addresses.find((a) => a.addressType === 'TO');

  return { from, to };
}
