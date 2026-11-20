import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Card, Muted } from "../components/ui";
import { colors } from "../theme";

const FAQS = [
  {
    q: "How do I join a class?",
    a: "Open My Classes, enter the join code from your teacher, then tap Join class.",
  },
  {
    q: "Where do I take quizzes?",
    a: "Go to My Quizzes → Upcoming, open a quiz, answer the questions, and submit.",
  },
  {
    q: "Where are my recommendations?",
    a: "After grading, open My Results or Progress to read personalized study advice.",
  },
  {
    q: "Who can use this mobile app?",
    a: "Students only. Teachers and admins use the QuizMind web platform.",
  },
];

export function HelpScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Card>
        <Text style={styles.title}>Student help</Text>
        <Muted>
          QuizMind Student gives you quizzes, classes, results, progress, announcements, messages,
          notifications, and feedback — the same student tools as the web app.
        </Muted>
      </Card>
      {FAQS.map((f) => (
        <Card key={f.q}>
          <Text style={styles.q}>{f.q}</Text>
          <Muted>{f.a}</Muted>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 8 },
  q: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 6 },
});
