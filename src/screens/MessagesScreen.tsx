import React, { useCallback, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Button, Card, Empty, Input, Loading, Muted } from "../components/ui";
import { api, ApiError } from "../lib/api";
import { colors } from "../theme";

export function MessagesScreen() {
  const nav = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.messages.list();
      setRows((res.data as any[]) || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading && !rows.length) return <Loading />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      {rows.length === 0 ? (
        <Empty text="No conversations yet" />
      ) : (
        rows.map((c) => (
          <Pressable key={c.id} onPress={() => nav.navigate("Chat", { conversationId: c.id, title: c.title || c.peerName || "Chat" })}>
            <Card>
              <Text style={styles.title}>{c.title || c.peerName || c.otherUser?.names || "Conversation"}</Text>
              <Muted>{c.lastMessage || c.preview || "Open chat"}</Muted>
            </Card>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

export function ChatScreen() {
  const route = useRoute<any>();
  const conversationId = route.params?.conversationId;
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.messages.get(conversationId);
      const data = res.data || res;
      setMessages(data.messages || data || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.messages.send(conversationId, text.trim());
      setText("");
      await load();
    } catch (e) {
      Alert.alert("Send failed", e instanceof ApiError ? e.message : "Try again");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        {messages.length === 0 ? (
          <Empty text="No messages yet" />
        ) : (
          messages.map((m: any, i: number) => (
            <Card key={m.id || i}>
              <Muted>{m.senderName || m.sender?.names || "User"}</Muted>
              <Text style={styles.msg}>{m.body || m.message || m.content}</Text>
            </Card>
          ))
        )}
      </ScrollView>
      <View style={styles.composer}>
        <Input value={text} onChangeText={setText} placeholder="Type a message" style={{ marginBottom: 8 }} />
        <Button title="Send" onPress={send} loading={sending} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  msg: { fontSize: 14, color: colors.text, marginTop: 4, lineHeight: 20 },
  composer: {
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
