import { useState } from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { ThemedText } from '../widgets/ThemeText';
import ImageUploader from '../components/ImageUploader';
import { DB } from '../utils/DB';
import { PrimaryButton } from '../widgets/Button';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../widgets/CustomInput';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppIcon from '../components/AppIcon';

export default function ShopSetupScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const navigation = useNavigation<any>();

  const filteredShopTypes = DB.shopTypes.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleNext = () => {
    if (selectedId) {
      navigation.navigate('Login'); // use the name of your stack screen
    }
  };

  return (
    <>
      <View className="flex-1 px-4">
        <View className="border border-base-content-2/25 bg-base-200 rounded-lg mt-10">
          <View className="items-center my-6">
            <ImageUploader />
            <ThemedText className="text-xl mt-2 !font-grotes-bold capitalize">
              My shop name
            </ThemedText>
            <ThemedText className="mt-0.5 !font-grotes-light">
              shop@email.com
            </ThemedText>
          </View>
        </View>

        <ThemedText className="text-xl !font-grotes-bold capitalize mb-2 mt-7">
          Select shop type
        </ThemedText>

        <View className="mb-4">
          <CustomInput
            icon="search-outline"
            placeholder="Search shop types..."
            value={searchText}
            onChangeText={setSearchText}
            IconComponent={Ionicons}
          />
        </View>

        <FlatList
          data={filteredShopTypes}
          keyExtractor={item => item.id}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: 'space-between', // keeps space between items
            paddingBottom: 10, // vertical gap between rows
          }}
          contentContainerStyle={{ paddingBottom: 50 }} // 👈 avoids cutoff at bottom
          renderItem={({ item }) => {
            const isSelected = selectedId === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedId(item.id)}
                className={`items-center p-4 rounded-lg bg-base-200 border ${isSelected ? 'border-primary' : 'border-transparent'}`}
                style={{ flexBasis: '32%' }}
              >
                <AppIcon
                  IconComponent={Ionicons}
                  name={item.icon}
                  size={28}
                  className={isSelected ? "text-primary" : "text-base-content-70"}

                />
                <ThemedText
                  className={`mt-2 text-sm text-center ${isSelected ? 'text-primary' : ''}`}
                >
                  {item.name}
                </ThemedText>
              </TouchableOpacity>
            );
          }}
        />

        {selectedId && (
          <View className="absolute bottom-4 left-0 right-0 px-4">
            <PrimaryButton
              title="Next"
              disabled={!selectedId}
              onPress={handleNext}
            />
          </View>
        )}
      </View>

      {/* <AddProduct /> */}
    </>
  );
}
