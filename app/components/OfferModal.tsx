import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface OfferModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (price: number, estimatedTime: number, notes: string) => void;
  issuePrice: number;
}

const OfferModal: React.FC<OfferModalProps> = ({
  visible,
  onClose,
  onSubmit,
  issuePrice,
}) => {
  const [price, setPrice] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{
    price?: string;
    estimatedTime?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      price?: string;
      estimatedTime?: string;
    } = {};

    if (!price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(price))) {
      newErrors.price = 'Price must be a number';
    }

    if (!estimatedTime) {
      newErrors.estimatedTime = 'Estimated time is required';
    } else if (isNaN(Number(estimatedTime))) {
      newErrors.estimatedTime = 'Estimated time must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(Number(price), Number(estimatedTime), notes);
      // Reset form
      setPrice('');
      setEstimatedTime('');
      setNotes('');
      setErrors({});
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.title}>Submit Offer</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Price (PKR)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            {errors.price && (
              <Text style={styles.errorText}>{errors.price}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Estimated Time (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter estimated time"
              value={estimatedTime}
              onChangeText={setEstimatedTime}
              keyboardType="numeric"
            />
            {errors.estimatedTime && (
              <Text style={styles.errorText}>{errors.estimatedTime}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add any additional notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Submit Offer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  notesInput: {
    height: 100,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  submitButton: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OfferModal; 