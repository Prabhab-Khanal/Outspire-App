import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function WaypointModal({ modalVisible, setModalVisible, pointName, setPointName, pickPointImage, pointImage, handlePointSubmit }) {
  return (
    <Modal visible={modalVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add Waypoint</Text>

          <TextInput
            style={styles.input}
            placeholder="Waypoint Name (optional)"
            value={pointName}
            onChangeText={setPointName}
          />

          <TouchableOpacity style={styles.imageButton} onPress={pickPointImage}>
            <FontAwesome name="camera" size={18} color="#fff" />
            <Text style={styles.imageButtonText}>Pick Image</Text>
          </TouchableOpacity>

          {pointImage && (
            <Image source={{ uri: pointImage }} style={styles.preview} />
          )}

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handlePointSubmit}>
              <Text style={styles.addText}>Add Point</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15, width: '85%' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#3a7758' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
  imageButton: { backgroundColor: '#3a7758', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  imageButtonText: { color: '#fff', marginLeft: 8 },
  preview: { width: '100%', height: 150, borderRadius: 8, marginTop: 15 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { backgroundColor: '#ccc', borderRadius: 8, padding: 10, flex: 0.48, alignItems: 'center' },
  addButton: { backgroundColor: '#3a7758', borderRadius: 8, padding: 10, flex: 0.48, alignItems: 'center' },
  cancelText: { color: '#333', fontWeight: 'bold' },
  addText: { color: '#fff', fontWeight: 'bold' },
});
