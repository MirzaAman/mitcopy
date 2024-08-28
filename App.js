import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Keyboard, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ExpoFileSystem from "expo-file-system";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { auth, db, storage } from './firebase/config';
import { addDoc, collection, getDocs, orderBy, query, onSnapshot, setDoc, doc, getDoc, deleteDoc, updateDoc, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { serverTimestamp } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';
import Main from './Main';


export default function App() {
  <Main/>
}

const styles = StyleSheet.create({
  appBar: {
    backgroundColor: '#fff',
    width: '100%',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    marginTop: 10,
    flexDirection: 'row',
    paddingRight: 20
  },
  container: {
    flex: 1,
    backgroundColor: '#6ea6db',
  },
  renderItem: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    marginTop: 10,
    minHeight: 120,
    maxHeight: 150,
    width: '90%',
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: 'center'
  },
  top: {
    flexDirection: 'row',
    // backgroundColor:'red',
    justifyContent: 'space-between',
  },
  font: {
    fontSize: 14,
    fontWeight: '500'
  },
  bottom: {
    flexDirection: 'row',
  },
  cD: {
    padding: 10,
    width: '50%'
  },
  pdf: {
    width: '50%',
    padding: 10,
    justifyContent: 'center'
  },
  invBtn: {
    borderColor: 'black',
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 30,
    alignSelf: 'center'
  },
  addBtn: {
    padding: 10
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedDocument: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  input: {
    padding: 10,
    borderWidth: 0.5,
    width: 250,
    marginTop: 10,
    fontSize: 15,
    fontWeight: '500',
    height: 50,
    borderRadius: 3,
    color: 'black'
  },
  pdfBtn: {
    marginTop: 10,
    height: 50,
    width: 120,
    borderWidth: 0.5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginTop: 40
  },
  pdfView: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  modalContainere:{
    flex:1,
  }
});