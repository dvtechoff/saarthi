import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { API_CONFIG } from '../config/api';

export default function DebugScreen() {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testNetwork = async () => {
    setResults([]);
    addResult('Starting network tests...');

    const urls = [
      { name: 'Localhost', url: 'http://localhost:8000/health' },
      { name: 'IP Address', url: 'http://192.168.1.37:8000/health' },
      { name: 'Android Emulator', url: 'http://10.0.2.2:8000/health' }
    ];

    for (const { name, url } of urls) {
      try {
        addResult(`Testing ${name}: ${url}`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.text();
          addResult(`✅ ${name} - Status: ${response.status}`);
          addResult(`Response: ${data.substring(0, 100)}...`);
        } else {
          addResult(`❌ ${name} - Status: ${response.status}`);
        }
      } catch (error: any) {
        addResult(`❌ ${name} - Error: ${error.message}`);
      }
    }
  };

  const testLogin = async () => {
    addResult('Testing login...');
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'commuter@test.com',
          password: 'password123'
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult(`✅ Login successful - Token: ${data.access_token.substring(0, 20)}...`);
        addResult(`User: ${data.user.email} (${data.user.role})`);
      } else {
        const errorData = await response.json();
        addResult(`❌ Login failed - Status: ${response.status}`);
        addResult(`Error: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error: any) {
      addResult(`❌ Login error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Debug</Text>
      
      <TouchableOpacity style={styles.button} onPress={testNetwork}>
        <Text style={styles.buttonText}>Test Network</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testLogin}>
        <Text style={styles.buttonText}>Test Login</Text>
      </TouchableOpacity>
      
      <View style={styles.results}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>{result}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  results: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
});
