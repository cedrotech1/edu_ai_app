import React, { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Badge, Card, Empty, Loading, Muted } from "../components/ui";
import { api } from "../lib/api";
import { colors } from "../theme";

export function QuizzesScreen() {
  const nav = useNavigation<any>();
  const [tab, setTab] = useState<"upcoming" | "completed">("upcoming");
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [up, done] = await Promise.all([
        api.quizzes.studentUpcoming(),
        api.quizzes.studentCompleted(),
      ]);
      setUpcoming((up.data as any[]) || []);
      setCompleted((done.data as any[]) || []);
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

  const rows = tab === "upcoming" ? upcoming : completed;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.tabs}>
        {(["upcoming", "completed"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "upcoming" ? "Upcoming" : "Completed"}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading && !rows.length ? (
        <Loading />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        >
          {rows.length === 0 ? (
            <Empty text={tab === "upcoming" ? "No upcoming quizzes" : "No completed quizzes yet"} />
          ) : (
            rows.map((q) => {
              const id = q.id || q.quizId;
              return (
                <Pressable
                  key={`${tab}-${id}`}
                  onPress={() =>
                    tab === "completed"
                      ? nav.navigate("ResultDetail", { quizId: id })
                      : nav.navigate("QuizDetail", { quizId: id })
                  }
                >
                  <Card>
                    <Text style={styles.title}>{q.title}</Text>
                    <Muted>
                      {q.subject || "General"}
                      {q.teacherName || q.teacher ? ` · ${q.teacherName || q.teacher}` : ""}
                    </Muted>
                    <View style={styles.meta}>
                      <Badge
                        label={tab === "completed" ? `${q.score ?? 0}%` : q.status || "open"}
                        tone={tab === "completed" ? "success" : "soft"}
                      />
                      {q.date || q.submittedAt ? (
                        <Muted>{q.date || new Date(q.submittedAt).toLocaleDateString()}</Muted>
                      ) : null}
                    </View>
                  </Card>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    margin: 16,
    marginBottom: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: colors.soft },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  title: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  meta: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
});
