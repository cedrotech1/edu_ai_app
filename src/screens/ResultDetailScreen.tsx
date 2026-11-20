import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { Badge, Card, Empty, Loading, Muted } from "../components/ui";
import { api } from "../lib/api";
import { colors } from "../theme";

export function ResultDetailScreen() {
  const route = useRoute<any>();
  const quizId = route.params?.quizId;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.quizzes.studentResults(quizId);
      setData(res.data || res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading && !data) return <Loading />;
  if (!data) return <Empty text="Result not found" />;

  const questions = data.questions || [];
  const recommendation = data.recommendation || data.aiRecommendation;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Card>
        <Text style={styles.title}>{data.quizTitle || data.title || "Quiz results"}</Text>
        <Muted>{data.subject || ""}</Muted>
        <View style={styles.scoreRow}>
          <Text style={styles.score}>{data.score ?? 0}%</Text>
          <View>
            <Muted>
              {data.correctCount ?? data.correctAnswers ?? 0}/{data.totalQuestions ?? questions.length} correct
            </Muted>
            {data.classRank ? <Muted>Rank: {data.classRank}</Muted> : null}
          </View>
        </View>
      </Card>

      {recommendation ? (
        <Card>
          <Text style={styles.section}>Study recommendation</Text>
          <Text style={styles.body}>{recommendation}</Text>
        </Card>
      ) : null}

      <Text style={styles.section}>Answers</Text>
      {questions.length === 0 ? (
        <Empty text="No question details available" />
      ) : (
        questions.map((q: any, i: number) => (
          <Card key={q.id || i}>
            <View style={styles.qHead}>
              <Text style={styles.qTitle}>Q{i + 1}</Text>
              <Badge
                label={q.isCorrect || q.correct ? "Correct" : "Review"}
                tone={q.isCorrect || q.correct ? "success" : "warn"}
              />
            </View>
            <Text style={styles.body}>{q.question || q.prompt || q.text}</Text>
            {q.studentAnswer != null ? (
              <Muted>Your answer: {String(q.studentAnswer)}</Muted>
            ) : null}
            {q.aiFeedback ? <Text style={styles.feedback}>{q.aiFeedback}</Text> : null}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 4 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 14 },
  score: { fontSize: 36, fontWeight: "800", color: colors.primary },
  section: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 8 },
  body: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 6 },
  qHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  qTitle: { fontWeight: "800", color: colors.primary },
  feedback: { marginTop: 8, fontSize: 13, color: colors.textMuted, fontStyle: "italic" },
});
