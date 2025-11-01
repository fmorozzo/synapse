import { View, Text, ScrollView } from 'react-native';

export default function CollectionScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-2">My Collection</Text>
        <Text className="text-gray-600 mb-6">
          Manage and organize your music collection
        </Text>

        <View className="bg-gray-50 p-8 rounded-lg items-center">
          <Text className="text-gray-600 text-center mb-4">
            Your collection is empty
          </Text>
          <Text className="text-gray-500 text-sm text-center">
            Start by scanning a barcode or searching for releases to add to your
            collection
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

