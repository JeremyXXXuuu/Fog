import {
  TextInput as DefaultTextInput,
  Pressable,
  Image,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { TextInput, Text, View } from "@/src/components/Themed";
import React, { useCallback, useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
const PlaceholderImage = require("@/assets/images/placeholderImage.png");
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import SelectRepasModal from "@/src/components/modals/food/SelectRepas";
import * as db from "@/src/db";

export function ImageViewer({
  placeholderImageSource,
  selectedImage,
}: {
  placeholderImageSource: any;
  selectedImage: string | undefined;
}) {
  const imageSource = selectedImage
    ? { uri: selectedImage }
    : placeholderImageSource;
  return (
    <Image
      source={imageSource}
      style={{ width: 320, height: 320, alignSelf: "center", borderRadius: 16 }}
    />
  );
}

const backToHome = () => {
  router.dismissAll();
  setTimeout(() => {
    router.push("/(tabs)/home");
  }, 0);
};

export function Button({
  label,
  theme,
  onPress,
  className,
}: {
  label: string;
  theme?: string;
  onPress: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="border-2 rounded-md border-black text-center p-2 m-2 bg-gray-200"
    >
      <Text>{label}</Text>
    </Pressable>
  );
}

type Macros = {
  C: string;
  P: string;
  F: string;
};

const Food = ({ id }: { id: string }) => {
  const [image, setImage] = useState<string | undefined>(undefined);
  const [food, setFood] = useState<any>(undefined);

  const [name, setName] = useState("");
  const [calories, setCalories] = useState<string>("");
  const [macros, setMacros] = useState<Macros>({ C: "", P: "", F: "" });
  const [repas, setRepas] = useState("");

  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (id !== "new" && db) {
      db.queryFoodById(id)
        .then((data) => {
          console.log(data);
          setName(data.name);
          setCalories(data.calories.toString());
          setMacros(data.macros);
          setRepas(data.repas);
          setLocation(data.location);
          setPrice(data.price);
          setImage(data.picture);
          setDateTime(new Date(data.time));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [db]);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result);
      // Get the local URI of the image
      let localUri = result.assets[0].uri;

      // Generate a new filename and path
      let filename = localUri.split("/").pop();
      console.log(filename);
      console.log(localUri);
      setImage(localUri);
    } else {
      alert("You did not select any image.");
    }
  };

  const showFood = () => {
    db.queryAllFood().catch((error) => {
      console.log(error);
    });
  };

  const saveFood = () => {
    try {
      console.log(image);
      if (!name) {
        alert("Please enter food name");
        return;
      }

      if (!image) {
        console.log("no image");
        console.log("placeholder image", PlaceholderImage);
      }
      console.log(
        calories,
        macros,
        Number(macros?.F)! * 9 + Number(macros?.P)! * 4 + Number(macros?.C)! * 4
      );

      const args = [
        name,
        calories == ""
          ? Number(macros?.F)! * 9 +
            Number(macros?.P)! * 4 +
            Number(macros?.C)! * 4
          : calories || 0,
        JSON.stringify(macros),
        dateTime.toISOString(),
        location,
        price.toString() || "",
        image?.toString() || "",
        1,
        repas,
      ];
      if (id !== "new") {
        console.log("updating", id);
        db.updateFood(id, args)
          .then(() => {
            backToHome();
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        console.log("inserting");
        db.insertFood(args)
          .then(() => {
            backToHome();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } catch (error) {
      console.log(error);
    }

    //https://github.com/expo/expo/issues/26922#issuecomment-1996862878
    // router.dismissAll();
    // setTimeout(() => {
    //   router.push("/(tabs)/home");
    // }, 0);
  };
  const [dateTime, setDateTime] = useState(new Date());
  const [mode, setMode] = useState<any>("date");
  const [show, setShow] = useState(false);
  const onChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    const currentDate = selectedDate;
    setShow(false);
    setDateTime(currentDate!);
  };

  const showMode = (currentMode: string) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };

  const clearDB = () => {
    db.clearDBAll().catch((error) => {
      console.log(error);
    });
  };

  const deleteFood = () => {
    db.deleteFood(id)
      .then(() => {
        backToHome();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const [keyboardShown, setKeyboardShown] = useState(false);

  useEffect(() => {
    // Add listeners for keyboard show/hide events
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardShown(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardShown(false);
      }
    );

    // Clean up the listeners when the component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = function (event: any) {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (currentScrollY < scrollY && keyboardShown) {
      // User is scrolling down
      Keyboard.dismiss();
    }
    setScrollY(currentScrollY);
  };

  const [showDialog, setShowDialog] = useState(false);

  const onSelectRepasPress = useCallback(() => {
    setShowDialog(true);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      enabled
      keyboardVerticalOffset={65}
    >
      <ScrollView
        className="flex flex-col gap-3 p-2 m-2"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View>
          <Pressable onPress={pickImageAsync}>
            <ImageViewer
              placeholderImageSource={PlaceholderImage}
              selectedImage={image}
            />
          </Pressable>
          <TextInput
            placeholder="Enter name"
            onChangeText={(text) => setName(text)}
            value={name}
            style={{ fontSize: 24, marginVertical: 16, height: 48 }}
          />

          <View className="flex flex-row justify-between items-center my-4">
            <View style={{ width: 68 }}>
              <Text style={{ textAlign: "center" }}>Calories</Text>
              <TextInput
                placeholder="Enter calories"
                onChangeText={(text) => {
                  // 将逗号替换为点
                  text = text.replace(",", ".");
                  // 只允许数字和小数点，并且最多两位小数
                  const regex = /^\d*\.?\d{0,2}$/;
                  if (regex.test(text)) {
                    setCalories(text);
                  }
                }}
                value={calories?.toString()}
                keyboardType="numeric"
              />
            </View>
            <View style={{ width: 68 }}>
              <Text style={{ textAlign: "center" }}>Carbs(g)</Text>
              <TextInput
                placeholder="carbs"
                onChangeText={(text) => {
                  // 将逗号替换为点
                  text = text.replace(",", ".");
                  // 只允许数字和小数点，并且最多两位小数
                  const regex = /^\d*\.?\d{0,2}$/;
                  if (regex.test(text)) {
                    setMacros({ ...macros, C: text });
                  }
                }}
                value={macros?.C?.toString()}
                keyboardType="numeric"
              />
            </View>
            <View style={{ width: 68 }}>
              <Text style={{ textAlign: "center" }}>Protein(g)</Text>
              <TextInput
                placeholder="protein"
                onChangeText={(text) => {
                  // 将逗号替换为点
                  text = text.replace(",", ".");
                  // 只允许数字和小数点，并且最多两位小数
                  const regex = /^\d*\.?\d{0,2}$/;
                  if (regex.test(text)) {
                    setMacros({ ...macros, P: text });
                  }
                }}
                value={macros?.P?.toString()}
                keyboardType="numeric"
              />
            </View>
            <View style={{ width: 68 }}>
              <Text style={{ textAlign: "center" }}>Fat(g)</Text>
              <TextInput
                placeholder="fat"
                onChangeText={(text) => {
                  // 将逗号替换为点
                  text = text.replace(",", ".");
                  // 只允许数字和小数点，并且最多两位小数
                  const regex = /^\d*\.?\d{0,2}$/;
                  if (regex.test(text)) {
                    setMacros({ ...macros, F: text });
                  }
                }}
                value={macros?.F?.toString()}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* show date time picker directly in ios,  */}
          <View className="my-2">
            {Platform.OS === "ios" ? (
              <SafeAreaView className="flex flex-row justify-between">
                <Text className="text-lg align-middle">Eating time: </Text>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={dateTime}
                  mode="datetime"
                  onChange={onChange}
                />
              </SafeAreaView>
            ) : (
              <View className="flex flex-row gap-2">
                <Button
                  label={dateTime.toLocaleDateString()}
                  onPress={showDatepicker}
                />
                <Button
                  label={dateTime.toLocaleTimeString()}
                  onPress={showTimepicker}
                />
              </View>
            )}
          </View>

          {show && (
            <DateTimePicker
              testID="dateTimePicker"
              value={dateTime}
              mode={mode}
              is24Hour={true}
              onChange={onChange}
            />
          )}

          <View className="flex flex-row justify-between my-2">
            <View className="w-5/12">
              <Text style={{ fontSize: 12, color: "gray" }}>
                (breakfast, lunch, dinner)
                <TouchableOpacity onPress={onSelectRepasPress}>
                  <Text>select meals</Text>
                </TouchableOpacity>
              </Text>
              <TextInput
                placeholder="Enter repas"
                onChangeText={(text) => setRepas(text)}
                value={repas}
              />

              <SelectRepasModal
                showDialog={showDialog}
                setShowDialog={setShowDialog}
                setRepas={setRepas}
              />
            </View>
            <View className="w-1/2">
              <Text style={{ fontSize: 12, color: "gray" }}>Location </Text>
              <TextInput
                placeholder="Enter location"
                onChangeText={(text) => setLocation(text)}
                value={location}
              />
            </View>
          </View>
          <View className="flex flex-row justify-between">
            <Text
              style={{
                color: "gray",
                fontSize: 18,
                textAlign: "center",
                textAlignVertical: "center",
                marginTop: 5,
              }}
            >
              Price €{" "}
            </Text>
            <TextInput
              placeholder="Enter price"
              onChangeText={(text) => setPrice(text)}
              value={price}
              keyboardType="numeric"
              className="w-3/4"
            />
          </View>

          <View className=" items-center my-4">
            <Pressable
              onPress={saveFood}
              style={{
                width: 320,
                height: 48,
                borderRadius: 16,
                backgroundColor: "#FFC53D",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text>Save Change</Text>
            </Pressable>
            <Pressable
              onPress={deleteFood}
              style={{
                width: 320,
                height: 48,
                borderRadius: 16,
                backgroundColor: "#FFC53D",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text>Delete it</Text>
            </Pressable>
            {/* <Button className="m-3" label="show" onPress={showFood} />
            <Button className="m-3" label="clear" onPress={clearDB} /> */}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Food;
