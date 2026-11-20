import React, { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Badge, Card, Empty, Loading, Muted } from "../components/ui";
import { api } from "../lib/api";
import { colors } from "../theme";

export function ProgressScreen() {
  const nav = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.progress.me();
      setData(res.data || res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading && !data) return <Loading />;
  if (!data) return <Empty text="Could not load progress" />;

  const subjects = data.subjectBreakdown || [];
  const recommendations = data.recommendations || [];
  const history = data.scoreHistory || [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Text style={styles.num}>{data.streak ?? 0}</Text>
          <Muted>Day streak</Muted>
        </Card>
        <Card style={styles.stat}>
          <Text style={styles.num}>{data.totalQuizzes ?? 0}</Text>
          <Muted>Quizzes</Muted>
        </Card>
        <Card style={styles.stat}>
          <Text style={styles.num}>{data.overallAvg ?? 0}%</Text>
          <Muted>Average</Muted>
        </Card>
      </View>

      <Text style={styles.section}>Score trend</Text>
      <Card>
        {history.length === 0 ? (
          <Muted>Complete quizzes to see your score trend.</Muted>
        ) : (
          history.slice(-8).map((h: any, i: number) => (
            <View key={`${h.date}-${i}`} style={styles.trendRow}>
              <Text style={styles.trendDate}>{h.date}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${Math.min(100, Number(h.score) || 0)}%` }]} />
              </View>
              <Text style={styles.trendScore}>{h.score}%</Text>
            </View>
          ))
        )}
      </Card>

      <Text style={styles.section}>By subject</Text>
      {subjects.length === 0 ? (
        <Empty text="No subject data yet" />
      ) : (
        subjects.map((s: any) => (
          <Card key={s.subject}>
            <View style={styles.subRow}>
              <Text style={styles.subName}>{s.subject}</Text>
              <Badge label={`${s.avg}%`} tone="soft" />
            </View>
            <Muted>{s.quizzes} quiz{s.quizzes === 1 ? "" : "zes"} completed</Muted>
          </Card>
        ))
      )}

      <Text style={styles.section}>Study recommendations</Text>
      {recommendations.length === 0 ? (
        <Empty text="No recommendations yet" />
      ) : (
        recommendations.map((r: any) => (
          <Pressable
            key={r.submissionId}
            onPress={() => nav.navigate("ResultDetail", { quizId: r.quizId })}
          >
            <Card>
              <Text style={styles.subName}>{r.title}</Text>
              <Muted>
                {r.subject || ""} {r.date ? `· ${r.date}` : ""} · {r.score}%
              </Muted>
              <Text style={styles.rec}>{r.recommendation}</Text>
            </Card>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: 10, marginBottom: 8 },
  stat: { flex: 1, marginBottom: 0 },
  num: { fontSize: 22, fontWeight: "800", color: colors.primary, marginBottom: 4 },
  section: { fontSize: 15, fontWeight: "700", color: colors.text, marginVertical: 10 },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  trendDate: { width: 58, fontSize: 11, color: colors.textMuted },
  barTrack: { flex: 1, height: 8, backgroundColor: colors.bg, borderRadius: 99, overflow: "hidden" },
  barFill: { height: 8, backgroundColor: colors.primary, borderRadius: 99 },
  trendScore: { width: 40, textAlign: "right", fontSize: 12, fontWeight: "700", color: colors.text },
  subRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  subName: { fontSize: 14, fontWeight: "700", color: colors.text },
  rec: { marginTop: 8, fontSize: 13, color: colors.textMuted, lineHeight: 18 },
});
