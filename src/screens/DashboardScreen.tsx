import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Badge, Card, Empty, Loading, Muted, Title } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { colors } from "../theme";

export function DashboardScreen() {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [up, done, notes] = await Promise.all([
        api.quizzes.studentUpcoming(),
        api.quizzes.studentCompleted(),
        api.notifications.list(),
      ]);
      setUpcoming((up.data as any[]) || []);
      setCompleted((done.data as any[]) || []);
      const rows = (notes.data as any[]) || [];
      setUnread(
        typeof notes.unreadCount === "number"
          ? notes.unreadCount
          : rows.filter((n) => !(n.isRead ?? n.read)).length
      );
    } catch {
      setUpcoming([]);
      setCompleted([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading && !upcoming.length && !completed.length) return <Loading />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Title>Hi, {user?.name?.split(" ")[0] || "Student"}</Title>
      <Muted>Your quizzes, progress, and class updates in one place.</Muted>

      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Text style={styles.statNum}>{upcoming.length}</Text>
          <Muted>Upcoming</Muted>
        </Card>
        <Card style={styles.stat}>
          <Text style={styles.statNum}>{completed.length}</Text>
          <Muted>Completed</Muted>
        </Card>
        <Card style={styles.stat}>
          <Text style={styles.statNum}>{unread}</Text>
          <Muted>Unread</Muted>
        </Card>
      </View>

      <View style={styles.rowBetween}>
        <Text style={styles.section}>Upcoming quizzes</Text>
        <Pressable onPress={() => nav.navigate("Quizzes")}>
          <Text style={styles.link}>See all</Text>
        </Pressable>
      </View>
      {upcoming.length === 0 ? (
        <Empty text="No upcoming quizzes" />
      ) : (
        upcoming.slice(0, 4).map((q) => (
          <Pressable key={q.id || q.quizId} onPress={() => nav.navigate("QuizDetail", { quizId: q.id || q.quizId })}>
            <Card>
              <Text style={styles.quizTitle}>{q.title}</Text>
              <Muted>
                {q.subject || "General"}
                {q.className || q.class ? ` · ${q.className || q.class}` : ""}
              </Muted>
              <View style={{ marginTop: 8 }}>
                <Badge label={q.status || "open"} tone="soft" />
              </View>
            </Card>
          </Pressable>
        ))
      )}

      <Text style={[styles.section, { marginTop: 8 }]}>Quick actions</Text>
      <View style={styles.actions}>
        {[
          { label: "My Classes", route: "Classes" },
          { label: "My Results", route: "Results" },
          { label: "Progress", route: "Progress" },
          { label: "Announcements", route: "Announcements" },
        ].map((a) => (
          <Pressable key={a.route} style={styles.action} onPress={() => nav.navigate(a.route)}>
            <Text style={styles.actionText}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: 10, marginTop: 16, marginBottom: 8 },
  stat: { flex: 1, marginBottom: 0 },
  statNum: { fontSize: 22, fontWeight: "800", color: colors.primary, marginBottom: 4 },
  section: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 10, marginTop: 8 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  link: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  quizTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  action: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    width: "48%",
  },
  actionText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
});
