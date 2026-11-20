import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Button, Card, Empty, Input, Loading, Muted } from "../components/ui";
import { api, ApiError } from "../lib/api";
import { colors } from "../theme";

export function QuizDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const quizId = route.params?.quizId;
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.quizzes.get(quizId);
      setQuiz(res.data || res);
    } catch {
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const submit = async () => {
    const questions = quiz?.questions || [];
    if (!questions.length) {
      Alert.alert("No questions", "This quiz has no questions yet");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        answers: questions.map((q: any) => ({
          questionId: q.id,
          value: answers[String(q.id)] ?? "",
          answer: answers[String(q.id)] ?? "",
        })),
      };
      await api.quizzes.submit(quizId, payload);
      Alert.alert("Submitted", "Your answers were sent for grading", [
        { text: "View result", onPress: () => nav.replace("ResultDetail", { quizId }) },
      ]);
    } catch (e) {
      Alert.alert("Submit failed", e instanceof ApiError ? e.message : "Try again");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !quiz) return <Loading />;
  if (!quiz) return <Empty text="Quiz not found" />;

  const questions = quiz.questions || [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Card>
        <Text style={styles.title}>{quiz.title}</Text>
        <Muted>
          {quiz.subject || "General"}
          {quiz.durationMinutes ? ` · ${quiz.durationMinutes} min` : ""}
        </Muted>
        {quiz.description ? <Text style={styles.desc}>{quiz.description}</Text> : null}
      </Card>

      {questions.length === 0 ? (
        <Empty text="Questions are not available for this quiz yet" />
      ) : (
        questions.map((q: any, i: number) => (
          <Card key={q.id}>
            <Text style={styles.qLabel}>Question {i + 1}</Text>
            <Text style={styles.qText}>{q.question || q.prompt || q.text}</Text>
            {(q.options || []).length > 0 ? (
              <View style={{ gap: 8 }}>
                {(q.options as string[]).map((opt, oi) => (
                  <Button
                    key={oi}
                    title={opt}
                    variant={answers[String(q.id)] === opt ? "primary" : "ghost"}
                    onPress={() => setAnswers((p) => ({ ...p, [String(q.id)]: opt }))}
                  />
                ))}
              </View>
            ) : (
              <Input
                value={answers[String(q.id)] || ""}
                onChangeText={(t) => setAnswers((p) => ({ ...p, [String(q.id)]: t }))}
                placeholder="Type your answer"
                multiline
              />
            )}
          </Card>
        ))
      )}

      {questions.length > 0 ? (
        <Button title="Submit quiz" onPress={submit} loading={submitting} />
      ) : null}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 4 },
  desc: { marginTop: 10, fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  qLabel: { fontSize: 12, fontWeight: "700", color: colors.primary, marginBottom: 6 },
  qText: { fontSize: 15, color: colors.text, marginBottom: 12, lineHeight: 22 },
});
