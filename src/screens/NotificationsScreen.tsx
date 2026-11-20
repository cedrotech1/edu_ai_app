import React, { useCallback, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Card, Empty, Loading, Muted } from "../components/ui";
import { api, ApiError } from "../lib/api";
import { colors } from "../theme";

export function NotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.notifications.list();
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

  const markAll = async () => {
    try {
      await api.notifications.markAllRead();
      await load();
    } catch (e) {
      Alert.alert("Error", e instanceof ApiError ? e.message : "Could not mark as read");
    }
  };

  const openOne = async (n: any) => {
    try {
      if (!(n.isRead ?? n.read)) await api.notifications.markRead(n.id);
      await load();
    } catch {
      /* ignore */
    }
  };

  if (loading && !rows.length) return <Loading />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <View style={{ marginBottom: 12 }}>
        <Button title="Mark all read" variant="ghost" onPress={markAll} />
      </View>
      {rows.length === 0 ? (
        <Empty text="No notifications" />
      ) : (
        rows.map((n) => {
          const unread = !(n.isRead ?? n.read);
          return (
            <Pressable key={n.id} onPress={() => openOne(n)}>
              <Card style={unread ? styles.unread : undefined}>
                <Text style={styles.title}>{n.title || n.message || "Notification"}</Text>
                <Muted>{n.body || n.message || ""}</Muted>
                <Muted>
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                  {unread ? " · Unread" : ""}
                </Muted>
              </Card>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  unread: { borderWidth: 1, borderColor: colors.soft },
  title: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 4 },
});
