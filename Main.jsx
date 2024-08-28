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


export default function Main() {

  const [isModalView, setIsModalView] = useState(false);

  // input states
  const [CustomerName, setCustomerName] = useState('');
  const [PhoneNumber, setPhoneNumber] = useState('');
  const [InvoiceID, setInvoiceID] = useState('');
  const [WorkType, setWorkType] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocumentName, setSelectedDocumentName] = useState(null);
  const [SubmitBtn, setSubmitBtn] = useState('Submit')
  const [data, setData] = useState([]);
  const [BtnView, setBtnView] = useState('flex');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [PDFModal, setPDFModal] = useState(false);
  const [Pdf, setPdf] = useState(null);

  // TEMP
  const pdfSampleURl = { uri: "https://firebasestorage.googleapis.com/v0/b/myappmit-ecd6e.appspot.com/o/pdfs%2FINVOICE%200154.pdf?alt=media&token=66e45e4d-4123-45c6-9c93-27c276d6a230", cache: true }
  // TEMP

  const downloadPdf = async (e) => {
    setPdf(e);
    console.log(`fetched pdf is ${e}`);
    setPDFModal(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(query(collection(db, 'entries'), orderBy('invID')));
      const fetchedData = [];
      querySnapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data() });
      });
      setData(fetchedData);
      setIsLoading(false); // Set isLoading to false after data is fetched
      setIsRefreshing(false); // Set isRefreshing to false after data is fetched
    } catch (error) {
      console.error('Error fetching data: ', error);
      setIsLoading(false); // Set isLoading to false if an error occurs
      setIsRefreshing(false); // Set isRefreshing to false if an error occurs
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true); // Set isRefreshing to true when refreshing starts
    fetchData();
  };

  const pickDocument = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      setSelectedDocument(result.assets[0].uri)
      setSelectedDocumentName(result.assets[0].name);

    } catch (error) {
      alert('Error picking document:', error);
    }
  };

  const handleKeyboardDidShow = () => {
    setBtnView('none');
  };

  const handleKeyboardDidHide = () => {
    setBtnView('flex');
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSubmit = async () => {
    if (CustomerName.length > 0) {
      if (PhoneNumber.length > 0) {
        if (InvoiceID.length > 0) {
          if (WorkType.length > 0) {
            if (selectedDocument) {

              const date = new Date();
              const formattedDate = `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}, ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;

              try {

                setSubmitBtn('Adding..');

                const response = await fetch(selectedDocument);
                const blob = await response.blob();
                const fileName = selectedDocumentName;
                const storageRef = ref(storage, 'pdfs/' + fileName);
                await uploadBytes(storageRef, blob);

                const downloadURL = await getDownloadURL(ref(storage, 'pdfs/' + fileName));


                const data = {
                  cname: CustomerName,
                  phn: PhoneNumber,
                  invID: InvoiceID,
                  wType: WorkType,
                  pdfURL: downloadURL,
                  date: formattedDate,
                  time: serverTimestamp(),
                }
                // await addDoc(collection(db, 'entries'), data)
                await addDoc(collection(db, 'entries'), data).then(async () => {
                  await fetchData()
                  setIsModalView(false)
                  setSubmitBtn('Submit'),
                    setCustomerName("")
                  setPhoneNumber("")
                  setInvoiceID("")
                  setWorkType("")
                  setSelectedDocument(null);
                  setSelectedDocumentName("");
                })

              } catch (error) {
                alert("Error : ", error)
              }
            } else {
              alert('Select Invoice PDF')
            }
          } else {
            alert('Enter Work Type')
          }
        } else {
          alert('Enter Invoice ID')
        }
      } else {
        alert('Enter Phone Number')
      }
    } else {
      alert('Enter Customer Name')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.font} >Mirza Innovation & Technology</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalView(true)} >
          <MaterialCommunityIcons name="plus" size={40} color="#0c98ca" />
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
      {isLoading ? ( // Show ActivityIndicator if isLoading is true
        <ActivityIndicator size="large" color="#fff" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }} >
              <View style={styles.renderItem}>
                <View style={styles.top} >
                  <Text style={[styles.font, { color: '#2f83d4' }]}>Invoice ID : #{item.invID}</Text>
                  <Text style={[styles.font, { marginRight: 15 }]}>{item.wType}</Text>
                </View>
                <View style={styles.bottom}>
                  <View style={styles.cD}>
                    <Text style={[styles.font]}>{item.cname}</Text>
                    <Text style={[styles.font, { marginTop: 5 }]}>{item.phn}</Text>
                  </View>
                  <View style={styles.pdf}>
                    <TouchableOpacity style={styles.invBtn} onPress={() => downloadPdf(item.pdfURL)} >
                      <Text>INVOICE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
          keyExtractor={item => item.id}
          refreshControl={ // Add refreshControl prop
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#9Bd35A', '#689F38']}
              tintColor="#9Bd35A"
              title="Loading..."
              titleColor="#000"
              progressBackgroundColor="#f3f3f3"
            />
          }
        />
      )}

      {/* Input Modal */}
      <Modal visible={isModalView} animationType="slide" onRequestClose={() => setIsModalView(false)}>
        <View style={styles.modalContainer}>
          <TextInput
            placeholder='Cusomter name'
            style={styles.input}
            value={CustomerName}
            onChangeText={(e) => setCustomerName(e)}
            autoCapitalize='characters'
          />
          <TextInput
            placeholder='Phone Number'
            style={styles.input}
            value={PhoneNumber}
            onChangeText={(e) => setPhoneNumber(e)}
          />
          <TextInput
            placeholder='Invoice ID'
            style={styles.input}
            value={InvoiceID}
            onChangeText={(e) => setInvoiceID(e)}
          />
          <TextInput
            placeholder='Work Type'
            style={styles.input}
            value={WorkType}
            onChangeText={(e) => setWorkType(e)}
            autoCapitalize='characters'
          />
          {selectedDocumentName && (
            <Text style={[styles.selectedDocument, { display: BtnView }]}>Selected PDF: {selectedDocumentName}</Text>
          )}
          <TouchableOpacity style={styles.pdfBtn} onPress={pickDocument}>
            <Text style={[styles.font, { display: BtnView }]}>{selectedDocumentName ? "Reselect PDF" : "Select PDF"} </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pdfBtn} onPress={handleSubmit} >
            <Text style={[styles.font, { display: BtnView, }]}>{SubmitBtn}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Input Modal */}

      {/* Invoice PDF View Modal */}
      <Modal visible={PDFModal} animationType='slide' onRequestClose={() => setPDFModal(false)}>
        <View style={styles.modalContainere}>
          <WebView
            source={{ uri: Pdf,}}
            style={{ flex: 1 }} // Ensure the WebView takes up the entire space
          />
        </View>
      </Modal>

      {/* Invoice PDF View Modal */}
    </SafeAreaView>
  );
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