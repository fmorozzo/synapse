import { View, Text, ScrollView } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-2">Profile</Text>
        <Text className="text-gray-600 mb-6">Manage your account settings</Text>

        {/* Profile Info */}
        <View className="bg-gray-50 p-4 rounded-lg mb-6">
          <Text className="text-gray-900 font-semibold mb-1">Guest User</Text>
          <Text className="text-gray-600 text-sm">
            Sign in to sync your collection
          </Text>
        </View>

        {/* Settings */}
        <View className="space-y-2">
          <View className="bg-white border border-gray-200 p-4 rounded-lg">
            <Text className="text-gray-900 font-semibold">Preferences</Text>
          </View>
          <View className="bg-white border border-gray-200 p-4 rounded-lg">
            <Text className="text-gray-900 font-semibold">Discogs Connection</Text>
          </View>
          <View className="bg-white border border-gray-200 p-4 rounded-lg">
            <Text className="text-gray-900 font-semibold">About</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

