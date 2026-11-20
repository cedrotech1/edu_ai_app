import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Badge, Card, Empty, Loading, Muted } from "../components/ui";
import { api } from "../lib/api";
import { colors } from "../theme";

export function AnnouncementsScreen() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.announcements.list();
      setItems((res.data as any[]) || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading && !items.length) return <Loading />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      {items.length === 0 ? (
        <Empty text="No announcements yet" />
      ) : (
        items.map((a) => (
          <Card key={a.id}>
            <Text style={styles.title}>{a.title}</Text>
            <Muted>
              {a.authorName || a.author?.names || "School"}
              {a.sentAt || a.createdAt
                ? ` · ${new Date(a.sentAt || a.createdAt).toLocaleString()}`
                : ""}
            </Muted>
            <Text style={styles.body}>{a.body || a.message}</Text>
            {a.status ? <Badge label={a.status} tone="success" /> : null}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  body: { marginTop: 10, fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 10 },
});
