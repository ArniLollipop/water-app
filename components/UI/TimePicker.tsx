import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

type UITimePickerModalProps = {
  minDate: Date;
};

const UITimePickerModal: React.FC<UITimePickerModalProps> = ({ minDate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<"date" | "time">("date");
  const [selectedDate, setSelectedDate] = useState<Date>(minDate); // Default to minDate
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date()); // Tracks the month being viewed

  const dateScrollViewRef = useRef<ScrollView>(null); // Reference for the ScrollView to scroll to top

  const toggleModal = () => {
    setIsVisible(!isVisible);
  };

  const confirmDate = () => {
    if (step === "date") {
      setStep("time");
    } else {
      toggleModal();
    }
  };

  const cancelDate = () => {
    setSelectedDate(minDate);
    setStep("date");
    toggleModal();
  };

  const handleChangeDate = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  // Helper function to generate all days in the current month
  const renderDateOptions = () => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate(); // Total days in the current month

    const datesInMonth = Array.from(Array(daysInMonth).keys()).map((i) => {
      const newDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        i + 1
      );
      return newDate;
    });

    return datesInMonth.map((date) => (
      <TouchableOpacity
        key={date.toDateString()}
        onPress={() => handleChangeDate(date)}
        style={[
          styles.option,
          selectedDate.getDate() === date.getDate() &&
          selectedDate.getMonth() === date.getMonth() &&
          selectedDate.getFullYear() === date.getFullYear()
            ? styles.selectedOption
            : null,
        ]}
        disabled={date < minDate} // Disable dates before minDate
      >
        <Text
          style={[
            styles.optionText,
            selectedDate.getDate() === date.getDate() &&
            selectedDate.getMonth() === date.getMonth() &&
            selectedDate.getFullYear() === date.getFullYear()
              ? styles.selectedOptionText
              : null,
            date < minDate ? styles.disabledText : null, // Disable date style
          ]}>
          {date.toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </Text>
      </TouchableOpacity>
    ));
  };

  const renderTimeOptions = (
    start: number,
    end: number,
    step = 1,
    isHour = true
  ) => {
    const options = [];
    for (let i = start; i <= end; i += step) {
      const value = i < 10 ? `0${i}` : `${i}`;
      const isDisabled =
        selectedDate.getDate() === minDate.getDate() &&
        selectedDate.getMonth() === minDate.getMonth() &&
        selectedDate.getFullYear() === minDate.getFullYear() &&
        ((isHour && i < minDate.getHours()) ||
          (!isHour && i < minDate.getMinutes()));

      options.push(
        <TouchableOpacity
          key={value}
          onPress={() => {
            const newDate = new Date(selectedDate);
            if (isHour) {
              newDate.setHours(i);
            } else {
              newDate.setMinutes(i);
            }
            setSelectedDate(newDate);
          }}
          style={[
            styles.option,
            (isHour && selectedDate.getHours() === i) ||
            (!isHour && selectedDate.getMinutes() === i)
              ? styles.selectedOption
              : null,
          ]}
          disabled={isDisabled} // Disable time options if earlier than minDate
        >
          <Text
            style={[
              styles.optionText,
              (isHour && selectedDate.getHours() === i) ||
              (!isHour && selectedDate.getMinutes() === i)
                ? styles.selectedOptionText
                : null,
              isDisabled ? styles.disabledText : null, // Disable time style
            ]}>
            {value}
          </Text>
        </TouchableOpacity>
      );
    }
    return options;
  };

  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const nextMonth = new Date(prevMonth);
      nextMonth.setMonth(prevMonth.getMonth() + 1);
      return nextMonth;
    });
    dateScrollViewRef.current?.scrollTo({ y: 0, animated: true }); // Scroll to top
  };

  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => {
      const previousMonth = new Date(prevMonth);
      previousMonth.setMonth(prevMonth.getMonth() - 1);
      return previousMonth;
    });
    dateScrollViewRef.current?.scrollTo({ y: 0, animated: true }); // Scroll to top
  };

  return (
    <View>
      <TouchableOpacity onPress={toggleModal} style={styles.openButton}>
        <Text style={styles.openButtonText}>Выбрать дату и время</Text>
      </TouchableOpacity>

      <Modal transparent={true} visible={isVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {step === "date" ? "Выберите дату" : "Выберите время"}
            </Text>

            {step === "date" && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  onPress={goToPreviousMonth}
                  style={styles.paginationButton}>
                  <Text style={styles.paginationButtonText}>Пред</Text>
                </TouchableOpacity>
                <Text style={styles.paginationTitle}>
                  {currentMonth.toLocaleDateString("ru-RU", {
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
                <TouchableOpacity
                  onPress={goToNextMonth}
                  style={styles.paginationButton}>
                  <Text style={styles.paginationButtonText}>След</Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView
              contentContainerStyle={styles.pickerContainer}
              ref={dateScrollViewRef}>
              {step === "date" ? (
                renderDateOptions() // Date selection options for the current month
              ) : (
                <>
                  <View style={styles.picker}>
                    <Text style={styles.pickerLabel}>Часы</Text>
                    <ScrollView style={styles.scrollPicker}>
                      {renderTimeOptions(
                        selectedDate.getDate() === minDate.getDate()
                          ? minDate.getHours()
                          : 0,
                        23,
                        1,
                        true
                      )}
                    </ScrollView>
                  </View>
                  <View style={styles.picker}>
                    <Text style={styles.pickerLabel}>Минуты</Text>
                    <ScrollView style={styles.scrollPicker}>
                      {renderTimeOptions(
                        0,
                        59,
                        5,
                        false // False indicates minutes
                      )}
                    </ScrollView>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={cancelDate}
                style={styles.cancelButton}>
                <Text style={styles.buttonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDate}
                style={styles.confirmButton}>
                <Text style={styles.buttonText}>
                  {step === "date" ? "Выбрать дату" : "Подтвердить"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={styles.selectedText}>
        Выбранное:{" "}
        {`${selectedDate.toLocaleDateString("ru-RU", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })} в ${selectedDate
          .getHours()
          .toString()
          .padStart(2, "0")}:${selectedDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  openButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  openButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    maxHeight: 400,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  paginationButton: {
    padding: 10,
  },
  paginationButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  paginationTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pickerContainer: {
    marginBottom: 20,
  },
  picker: {
    flex: 1,
    alignItems: "center",
  },
  pickerLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scrollPicker: {
    height: 100, // Reduced height to show fewer items at once
  },
  option: {
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 18,
    textAlign: "center",
  },
  selectedOption: {
    backgroundColor: "#007AFF", // Selected background color
    borderRadius: 8,
  },
  selectedOptionText: {
    color: "#fff", // Selected text color
  },
  disabledText: {
    color: "#ccc", // Style for disabled dates and times
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  selectedText: {
    fontSize: 18,
    marginTop: 20,
    textAlign: "center",
  },
});

export default UITimePickerModal;
