import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, Smartphone } from 'lucide-react-native';

export default function LoginScreen() {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Login successful!');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Hello</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.loginMethods}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                loginMethod === 'email' && styles.activeMethodButton,
              ]}
              onPress={() => setLoginMethod('email')}>
              <Mail size={20} color={loginMethod === 'email' ? '#fff' : '#666'} />
              <Text
                style={[
                  styles.methodText,
                  loginMethod === 'email' && styles.activeMethodText,
                ]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.methodButton,
                loginMethod === 'phone' && styles.activeMethodButton,
              ]}
              onPress={() => setLoginMethod('phone')}>
              <Smartphone size={20} color={loginMethod === 'phone' ? '#fff' : '#666'} />
              <Text
                style={[
                  styles.methodText,
                  loginMethod === 'phone' && styles.activeMethodText,
                ]}>
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                {loginMethod === 'email' ? (
                  <Mail size={20} color="#666" />
                ) : (
                  <Smartphone size={20} color="#666" />
                )}
                <TextInput
                  style={styles.input}
                  placeholder={loginMethod === 'email' ? 'Email address' : 'Phone number'}
                  placeholderTextColor="#666"
                  value={loginMethod === 'email' ? email : phone}
                  onChangeText={loginMethod === 'email' ? setEmail : setPhone}
                  keyboardType={loginMethod === 'email' ? 'email-address' : 'phone-pad'}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}>
                  {showPassword ? (
                    <EyeOff size={20} color="#666" />
                  ) : (
                    <Eye size={20} color="#666" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}>
              <Text style={styles.loginButtonText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/auth/register" style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Sign Up</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
  },
  loginMethods: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 16,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#1a1a1a',
    gap: 8,
  },
  activeMethodButton: {
    backgroundColor: '#FF6B6B',
  },
  methodText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  activeMethodText: {
    color: '#fff',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    marginLeft: 4,
  },
  footerLinkText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: 'bold',
  },
});