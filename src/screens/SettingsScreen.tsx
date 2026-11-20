import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Input, Muted } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { api, ApiError, API_BASE, initials } from "../lib/api";
import { colors } from "../theme";

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  const sendFeedback = async () => {
    if (message.trim().length < 5) {
      Alert.alert("Write a short message");
      return;
    }
    setSendingFeedback(true);
    try {
      await api.feedback.create({ rating, message: message.trim(), category: "general" });
      setMessage("");
      Alert.alert("Thanks", "Your feedback was sent");
    } catch (e) {
      Alert.alert("Failed", e instanceof ApiError ? e.message : "Try again");
    } finally {
      setSendingFeedback(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("New passwords do not match");
      return;
    }
    setSavingPass(true);
    try {
      await api.users.changePassword({ currentPassword, newPassword, confirmPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Updated", "Password changed");
    } catch (e) {
      Alert.alert("Failed", e instanceof ApiError ? e.message : "Try again");
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Card>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user?.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name}</Text>
            <Muted>{user?.email}</Muted>
            <Muted>{user?.school || "Student"}</Muted>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.section}>API</Text>
        <Muted>{API_BASE}</Muted>
      </Card>

      <Card>
        <Text style={styles.section}>Change password</Text>
        <Input secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" />
        <Input secureTextEntry value={newPassword} onChangeText={setNewPassword} placeholder="New password" />
        <Input secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm new password" />
        <Button title="Update password" onPress={changePassword} loading={savingPass} />
      </Card>

      <Card>
        <Text style={styles.section}>Send feedback</Text>
        <Muted>Rate QuizMind and tell us what to improve.</Muted>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Button
              key={n}
              title={n <= rating ? "★" : "☆"}
              variant={n <= rating ? "primary" : "ghost"}
              onPress={() => setRating(n)}
            />
          ))}
        </View>
        <Input
          value={message}
          onChangeText={setMessage}
          placeholder="Your message"
          multiline
          style={{ minHeight: 80, textAlignVertical: "top" }}
        />
        <Button title="Send feedback" onPress={sendFeedback} loading={sendingFeedback} />
      </Card>

      <Button title="Log out" variant="danger" onPress={() => logout()} />
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: "row", gap: 14, alignItems: "center" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800" },
  name: { fontSize: 18, fontWeight: "800", color: colors.text },
  section: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 8 },
  stars: { flexDirection: "row", gap: 6, marginVertical: 12, flexWrap: "wrap" },
});
