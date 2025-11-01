import { View, Text, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-3xl font-bold mb-2">Welcome to Synapse</Text>
        <Text className="text-gray-600 mb-6">
          Your intelligent music collection manager
        </Text>

        {/* Stats Cards */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-purple-50 p-4 rounded-lg">
            <Text className="text-purple-600 font-semibold text-2xl">0</Text>
            <Text className="text-gray-600 text-sm">Records</Text>
          </View>
          <View className="flex-1 bg-pink-50 p-4 rounded-lg">
            <Text className="text-pink-600 font-semibold text-2xl">$0</Text>
            <Text className="text-gray-600 text-sm">Value</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-xl font-bold mb-4">Quick Actions</Text>
        <View className="space-y-3">
          <View className="bg-purple-600 p-4 rounded-lg">
            <Text className="text-white font-semibold">Scan Barcode</Text>
            <Text className="text-purple-100 text-sm">
              Quickly add records by scanning
            </Text>
          </View>
          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="text-gray-900 font-semibold">Search Discogs</Text>
            <Text className="text-gray-600 text-sm">
              Find releases to add
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

