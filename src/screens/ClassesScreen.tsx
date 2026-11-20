import React, { useCallback, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Button, Card, Empty, Input, Loading, Muted } from "../components/ui";
import { api, ApiError } from "../lib/api";
import { colors } from "../theme";

export function ClassesScreen() {
  const nav = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.classes.list();
      setClasses((res.data as any[]) || []);
    } catch {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const join = async () => {
    if (!code.trim()) {
      Alert.alert("Join code required");
      return;
    }
    setJoining(true);
    try {
      await api.classes.join(code.trim());
      setCode("");
      Alert.alert("Joined", "You are now in the class");
      await load();
    } catch (e) {
      Alert.alert("Could not join", e instanceof ApiError ? e.message : "Try again");
    } finally {
      setJoining(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Card>
        <Text style={styles.heading}>Join a class</Text>
        <Muted>Enter the join code from your teacher.</Muted>
        <View style={{ height: 10 }} />
        <Input
          value={code}
          onChangeText={setCode}
          placeholder="Class code"
          autoCapitalize="characters"
        />
        <Button title="Join class" onPress={join} loading={joining} />
      </Card>

      <Text style={styles.section}>My classes</Text>
      {loading && !classes.length ? (
        <Loading />
      ) : classes.length === 0 ? (
        <Empty text="You have not joined any classes yet" />
      ) : (
        classes.map((c) => (
          <Pressable key={c.id} onPress={() => nav.navigate("ClassDetail", { classId: c.id })}>
            <Card>
              <Text style={styles.title}>{c.name}</Text>
              <Muted>
                {c.subject || "Subject"}
                {c.teacherName || c.teacher?.names ? ` · ${c.teacherName || c.teacher?.names}` : ""}
              </Muted>
              {c.code ? <Text style={styles.code}>Code: {c.code}</Text> : null}
            </Card>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 4 },
  section: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 10, marginTop: 8 },
  title: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  code: { marginTop: 8, fontSize: 12, color: colors.primary, fontWeight: "600" },
});
