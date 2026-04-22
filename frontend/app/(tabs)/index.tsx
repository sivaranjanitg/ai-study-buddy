import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000");

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [studentClass, setStudentClass] = useState("6");
  const [chat, setChat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { type: "user", text: message };
    setChat(prev => [...prev, userMsg]);

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: message,
          student_class: studentClass
        })
      });

      const data = await res.json();

      const botMsg = {
        type: "bot",
        text: data.answer || data.error || "No response"
      };

      setChat(prev => [...prev, botMsg]);
    } catch {
      const errorMsg = {
        type: "bot",
        text: "Error connecting to server"
      };
      setChat(prev => [...prev, errorMsg]);
    }

    setMessage("");
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.classSelector}>
          {["6", "7", "8"].map(cls => (
            <TouchableOpacity
              key={cls}
              style={[
                styles.classButton,
                studentClass === cls && styles.classButtonActive
              ]}
              onPress={() => setStudentClass(cls)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.classButtonText,
                  studentClass === cls && styles.classButtonTextActive
                ]}
              >
                Class {cls}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={chat}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 10 }}
          renderItem={({ item }) => (
            <View style={
              item.type === "user" ? styles.user : styles.bot
            }>
              <Text>{item.text}</Text>
            </View>
          )}
        />

        {loading && <ActivityIndicator size="small" />}

        <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Ask your doubt..."
          placeholderTextColor="#888"   // 👈 ADD
          style={styles.input}
        />

          <TouchableOpacity
            style={styles.button}
            onPress={sendMessage}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  },

  classSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12
  },

  classButton: {
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff"
  },

  classButtonActive: {
    backgroundColor: "#4CAF50"
  },

  classButtonText: {
    color: "#4CAF50",
    fontWeight: "600"
  },

  classButtonTextActive: {
    color: "#fff"
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    backgroundColor: "#fff",   // 👈 ADD THIS
    color: "#000"              // 👈 ADD THIS
  },

  button: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold"
  },

  user: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "80%"
  },

  bot: {
    alignSelf: "flex-start",
    backgroundColor: "#EEE",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "80%"
  }
});
