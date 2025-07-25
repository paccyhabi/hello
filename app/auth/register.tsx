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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, Smartphone, User } from 'lucide-react-native';

export default function RegisterScreen() {
  const [registrationMethod, setRegistrationMethod] = useState<'email' | 'phone'>('email');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    
    // Simulate registration process
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Account created successfully!');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Join Hello</Text>
              <Text style={styles.subtitle}>Create your account to get started</Text>
            </View>

            <View style={styles.registrationMethods}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  registrationMethod === 'email' && styles.activeMethodButton,
                ]}
                onPress={() => setRegistrationMethod('email')}>
                <Mail size={20} color={registrationMethod === 'email' ? '#fff' : '#666'} />
                <Text
                  style={[
                    styles.methodText,
                    registrationMethod === 'email' && styles.activeMethodText,
                  ]}>
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  registrationMethod === 'phone' && styles.activeMethodButton,
                ]}
                onPress={() => setRegistrationMethod('phone')}>
                <Smartphone size={20} color={registrationMethod === 'phone' ? '#fff' : '#666'} />
                <Text
                  style={[
                    styles.methodText,
                    registrationMethod === 'phone' && styles.activeMethodText,
                  ]}>
                  Phone
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <User size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#666"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  {registrationMethod === 'email' ? (
                    <Mail size={20} color="#666" />
                  ) : (
                    <Smartphone size={20} color="#666" />
                  )}
                  <TextInput
                    style={styles.input}
                    placeholder={registrationMethod === 'email' ? 'Email address' : 'Phone number'}
                    placeholderTextColor="#666"
                    value={registrationMethod === 'email' ? email : phone}
                    onChangeText={registrationMethod === 'email' ? setEmail : setPhone}
                    keyboardType={registrationMethod === 'email' ? 'email-address' : 'phone-pad'}
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

              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#666"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}>
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#666" />
                    ) : (
                      <Eye size={20} color="#666" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}>
                <Text style={styles.registerButtonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <View style={styles.terms}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/auth/login" style={styles.footerLink}>
                <Text style={styles.footerLinkText}>Sign In</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
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
    textAlign: 'center',
  },
  registrationMethods: {
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
    marginBottom: 32,
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
  registerButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  terms: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  termsText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#FF6B6B',
    textDecorationLine: 'underline',
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