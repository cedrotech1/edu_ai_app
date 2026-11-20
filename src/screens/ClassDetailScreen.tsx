import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { Card, Empty, Loading, Muted } from "../components/ui";
import { api } from "../lib/api";
import { colors } from "../theme";

export function ClassDetailScreen() {
  const route = useRoute<any>();
  const classId = route.params?.classId;
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.classes.get(classId);
      setDetail(res.data || res);
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading && !detail) return <Loading />;
  if (!detail) return <Empty text="Class not found" />;

  const quizzes = detail.quizzes || detail.recentQuizzes || [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Card>
        <Text style={styles.title}>{detail.name}</Text>
        <Muted>
          {detail.subject || "Subject"}
          {detail.code ? ` · Code ${detail.code}` : ""}
        </Muted>
        {detail.teacherName || detail.teacher?.names ? (
          <Muted>Teacher: {detail.teacherName || detail.teacher?.names}</Muted>
        ) : null}
      </Card>

      <Text style={styles.section}>Class quizzes</Text>
      {quizzes.length === 0 ? (
        <Empty text="No quizzes in this class yet" />
      ) : (
        quizzes.map((q: any) => (
          <Card key={q.id}>
            <Text style={styles.quiz}>{q.title}</Text>
            <Muted>{q.status || "—"}</Muted>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 6 },
  section: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 10, marginTop: 4 },
  quiz: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 4 },
});
