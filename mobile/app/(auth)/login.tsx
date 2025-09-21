import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { clearError, loginUser } from "../../store/slices/authSlice";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);
  const { isLoading, error, isAuthenticated, user } = authState || { 
    isLoading: false, 
    error: null, 
    isAuthenticated: false, 
    user: null 
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(`/(${user.role})`);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (error) {
      Alert.alert("Login Failed", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    dispatch(loginUser({ email: email.trim(), password }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="bus-outline" size={32} color="#8B5CF6" />
          </View>
          <Text style={styles.title}>Bus Tracker</Text>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue your journey.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email or Phone"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Register */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Don't have an account?{" "}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  logoContainer: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
    color: "#333",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  passwordInput: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  loginButton: {
    height: 56,
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#666",
  },
  registerLink: {
    fontSize: 14,
    color: "#8B5CF6",
    fontWeight: "600",
  },
});
