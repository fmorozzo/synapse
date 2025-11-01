import { View, Text } from 'react-native';

export default function ScanScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold mb-2">Scan Barcode</Text>
      <Text className="text-gray-600 text-center">
        Barcode scanning feature coming soon. This will allow you to quickly add
        records to your collection by scanning their barcodes.
      </Text>
    </View>
  );
}

