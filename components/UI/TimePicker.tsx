import Colors from "@/constants/Colors";
import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ListRenderItem,
  Pressable,
} from "react-native";
import UIButton from "./Button";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type UITimePickerModalProps = {
  disabled: boolean;
  minDate: Date;
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  userType: boolean,
  startTime: number;
  setStartTime: (time: number) => void;
  endTime: number;
  setEndTime: (time: number) => void;
  qwe: boolean
};

const UITimePickerModal: React.FC<UITimePickerModalProps> = ({
  disabled,
  minDate,
  selectedDate,
  setSelectedDate,
  userType,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  qwe
}) => {
  const { user } = useSelector((state: RootState) => state.user);

  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<"date" | "time">("date");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(minDate));

  const dateScrollViewRef = useRef<FlatList<Date>>(null);

  const toggleModal = () => {
    setIsVisible(!isVisible);
  };

  const confirmDate = () => {
    if (step === "date" && user?.chooseTime && qwe) {
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
    const adjustedDate = new Date(newDate);
    adjustedDate.setHours(12, 0, 0, 0); // Устанавливаем время на 12:00 дня
    setSelectedDate(adjustedDate);
  };

  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const nextMonth = new Date(prevMonth);
      nextMonth.setMonth(prevMonth.getMonth() + 1);
      return nextMonth;
    });
    dateScrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const goToPreviousMonth = () => {
    if (
      currentMonth.getFullYear() === minDate.getFullYear() &&
      currentMonth.getMonth() === minDate.getMonth()
    ) {
      return;
    }
    setCurrentMonth((prevMonth) => {
      const previousMonth = new Date(prevMonth);
      previousMonth.setMonth(prevMonth.getMonth() - 1);
      return previousMonth;
    });
    dateScrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const isWorkHour = () => {
    if (!userType) {
      return false
    }
    const time = new Date(minDate).toLocaleTimeString();
    const [hour, minute] = time
      .split(":")
      .map((item) => parseInt(item)) as number[];
    
    if (hour >= 12) {
      return false
    }

    return true
  };

  const datesInMonth = () => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

    const resetTime = (date: Date) => {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    };
    const minDateReset = resetTime(minDate);

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        i + 1
      );
      return date;
    });

    if (isWorkHour()) {
      return days.filter((date) => resetTime(date) >= minDateReset && date.getDay() !== 0);
    } else {
      return days.filter((date) => resetTime(date) > minDateReset && date.getDay() !== 0);
    }
  };

  const renderDateItem: ListRenderItem<Date> = ({ item: date }) => {
    const resetTime = (date: Date) => {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    };

    const isSelected = selectedDate
      ? resetTime(selectedDate).getTime() === resetTime(date).getTime()
      : false;

    const isDisabled = resetTime(date) < resetTime(minDate);

    return (
      <TouchableOpacity
        onPress={() => handleChangeDate(date)}
        style={[styles.option, isSelected ? styles.selectedOption : null]}
        disabled={isDisabled}>
        <Text
          style={[
            styles.optionText,
            isSelected ? styles.selectedOptionText : null,
            isDisabled ? styles.disabledText : null,
          ]}>
          {date.toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTimeOptions = (start: number, end: number, step = 1) => {
    const options = [];
    for (let i = start; i <= end; i += step) {
      options.push(i);
    }
    return options;
  };

  // const renderTimeOptions = (
  //   start: number,
  //   end: number,
  //   step = 1,
  //   isHour = true
  // ) => {
  //   const options = [];
  //   for (let i = start; i <= end; i += step) {
  //     const value = i < 10 ? `0${i}` : `${i}`;

  //     const time = new Date(minDate).toLocaleTimeString();
  //     const [hour, minute] = time
  //       .split(":")
  //       .map((item) => parseInt(item)) as number[];

  //     const second = hour * 60 * 60 + minute * 60;
  //     const halfHour = 60 * 60 + 30 * 60;
  //     const workEnd = 21 * 60 * 60;

  //     // проверка time + 1:30 >= workEnd иначе не показывать и остальные проверки
  //     const isDisabled =
  //       second + halfHour >= workEnd ||
  //       (isHour && i < 9) || // Начало рабочего дня
  //       (isHour && i >= 21) || // Конец рабочего дня
  //       (!isHour && i % 10 !== 0) || // Минуты только кратные 10
  //       (isHour && (i + 1) * 60 * 60 < second + halfHour) || // Не показывать часы, если меньше чем час
  //       (!isHour && selectedDate
  //         ? new Date(selectedDate).getHours() * 60 * 60 + i * 60 <
  //           second + halfHour
  //         : false); // Не показывать минуты, если меньше чем полчаса

  //     if (!isDisabled)
  //       options.push(
  //         <TouchableOpacity
  //           key={value}
  //           onPress={() => {
  //             const newDate = new Date(selectedDate || new Date());
  //             if (isHour) {
  //               newDate.setHours(i);
  //             } else {
  //               newDate.setMinutes(i);
  //             }
  //             setSelectedDate(newDate);
  //           }}
  //           style={[
  //             styles.option,
  //             (isHour && selectedDate
  //               ? selectedDate.getHours() === i
  //               : false) ||
  //             (!isHour && selectedDate
  //               ? selectedDate.getMinutes() === i
  //               : false)
  //               ? styles.selectedOption
  //               : null,
  //           ]}>
  //           <Text
  //             style={[
  //               styles.optionText,
  //               (isHour && selectedDate
  //                 ? selectedDate.getHours() === i
  //                 : false) ||
  //               (!isHour && selectedDate
  //                 ? selectedDate.getMinutes() === i
  //                 : false)
  //                 ? styles.selectedOptionText
  //                 : null,
  //               isDisabled ? styles.disabledText : null,
  //             ]}>
  //             {value}
  //           </Text>
  //         </TouchableOpacity>
  //       );
  //   }
  //   return options;
  // };

  return (
    <View>
      <UIButton
        isLoading={disabled}
        text={user?.chooseTime ? "Выбрать дату и время" : "Выбрать дату"}
        onPress={toggleModal}
        type="default"
      />

      <Modal transparent={true} visible={isVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {step === "date" ? "Выберите дату" : "Выберите время"}
            </Text>

            {step === "date" && (
              <View style={styles.paginationContainer}>
                <Pressable
                  onPress={goToPreviousMonth}
                  style={styles.paginationButton}>
                  <Text style={styles.paginationButtonText}>Пред</Text>
                </Pressable>
                <Text style={styles.paginationTitle}>
                  {currentMonth.toLocaleDateString("ru-RU", {
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
                <Pressable
                  onPress={goToNextMonth}
                  style={styles.paginationButton}>
                  <Text style={styles.paginationButtonText}>След</Text>
                </Pressable>
              </View>
            )}

            {step === "date" ? (
              <FlatList
                data={datesInMonth()}
                renderItem={renderDateItem}
                keyExtractor={(item) => item.toDateString()}
                ref={dateScrollViewRef}
                contentContainerStyle={styles.pickerContainer}
                initialNumToRender={10} // Ограничение рендеринга до первых 10 элементов
                windowSize={5} // Для виртуализации, чтобы рендерить только видимые элементы
              />
            ) : (
              <View style={styles.timePickerContainer}>
                <View style={styles.picker}>
                  <Text style={styles.pickerLabel}>От</Text>
                  <FlatList
                    style={{ maxHeight: 200, height: "auto" }}
                    data={renderTimeOptions(9, 20, 1)}  // Передаем массив чисел
                    keyExtractor={(item) => item.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => setStartTime(item)}
                        style={[
                          styles.option,
                          startTime === item ? styles.selectedOption : null,
                        ]}>
                        <Text style={styles.optionText}>
                          {item.toString().padStart(2, "0")}:00
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
                <View style={styles.picker}>
                  <Text style={styles.pickerLabel}>До</Text>
                  <FlatList
                    style={{ maxHeight: 200, height: "auto" }}
                    data={renderTimeOptions(9, 20, 1)}  // Передаем массив чисел
                    keyExtractor={(item) => item.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => setEndTime(item)}
                        style={[
                          styles.option,
                          endTime === item ? styles.selectedOption : null,
                        ]}>
                        <Text style={styles.optionText}>
                          {item.toString().padStart(2, "0")}:00
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                  {/* <FlatList
                    data={renderTimeOptions(
                      startTime ? startTime + 1 : 10, // "До" минимум на 1 час позже "От"
                      21,
                      endTime,
                      setEndTime
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => item}
                  /> */}
                </View>
              </View>
              // <View style={styles.timePickerContainer}>
              //   <View style={styles.picker}>
              //     <Text style={styles.pickerLabel}>Часы</Text>
              //     <FlatList
              //       data={
              //         selectedDate
              //           ? renderTimeOptions(
              //               selectedDate.getDate() === minDate.getDate()
              //                 ? minDate.getHours()
              //                 : 0,
              //               21,
              //               1,
              //               true
              //             )
              //           : []
              //       }
              //       keyExtractor={(item, index) => index.toString()}
              //       renderItem={({ item }) => item}
              //       initialNumToRender={10}
              //       windowSize={5}
              //       style={{
              //         maxHeight: 240,
              //         height: 200,
              //         overflow: "scroll",
              //       }}
              //     />
              //   </View>
              //   <View style={styles.picker}>
              //     <Text style={styles.pickerLabel}>Минуты</Text>
              //     <FlatList
              //       key={selectedDate ? selectedDate.toTimeString() : ""}
              //       data={renderTimeOptions(0, 59, 10, false)}
              //       keyExtractor={(item, index) => index.toString()}
              //       renderItem={({ item }) => item}
              //       initialNumToRender={10}
              //       windowSize={5}
              //       style={{
              //         maxHeight: 240,
              //         height: 200,
              //         overflow: "scroll",
              //       }}
              //     />
              //   </View>
              // </View>
            )}

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

      {selectedDate && (
        <Text style={styles.selectedText}>
          Выбранное:{" "}
          {`${selectedDate.toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })} `}
          {user?.chooseTime &&
  `с ${startTime?.toString().padStart(2, "0")}:00 до ${endTime?.toString().padStart(2, "0")}:00`}
          {/* {user?.chooseTime &&
            `в ${selectedDate
              .getHours()
              .toString()
              .padStart(2, "0")}:${selectedDate
              .getMinutes()
              .toString()
              .padStart(2, "0")}`} */}
        </Text>
      )}
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
    zIndex: 100000,
    position: "relative",
  },
  paginationButton: {
    padding: 10,
    zIndex: 10000,
    position: "relative",
  },
  paginationButtonText: {
    fontSize: 16,
    color: Colors.tint,
    zIndex: 100000,
  },
  paginationTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pickerContainer: {
    marginBottom: 20,
  },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  option: {
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 18,
    textAlign: "center",
  },
  selectedOption: {
    backgroundColor: Colors.tint,
    borderRadius: 8,
  },
  selectedOptionText: {
    color: "#fff",
  },
  disabledText: {
    color: Colors.disabled,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: Colors.disabled,
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: Colors.tint,
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
    color: Colors.text,
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
});

export default UITimePickerModal;
