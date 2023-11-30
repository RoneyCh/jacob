import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
      padding: 16,
    },
    input: {
      backgroundColor: '#CFF5C7',
      height: 40,
      borderColor: "gray",
      borderWidth: 1,
      marginBottom: 12,
      paddingHorizontal: 8,
    },
    screensCard: {
        backgroundColor: "#CAFF8A",
        borderRadius: 8,
        height: 120,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        marginBottom: 8,
    
    },
    screensCardHome: {
      backgroundColor: "#CAFF8A",
      borderRadius: 8,
      height: 120,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: "#ccc",
      marginBottom: 8,
  
  },
    screenItem: {
      width: "100%"
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    buttonContainer: {
      flexDirection: "row",
    },
    screenName: {
      fontSize: 18,
      flexShrink: 1,
      fontFamily: "rubik-medium-italic",
    },
    screenGenre: {
      color: "#555",
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    modalContent: {
      backgroundColor: "#E6F5C7",
      borderRadius: 8,
      padding: 16,
      width: "100%",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 16,
    },
    modalButton: {
      backgroundColor: "#182D00", // Cor de fundo do botão
      borderRadius: 50,
      padding: 12,
      alignItems: "center",
      marginTop: 16,
    },
    modalButtonSq: {
      backgroundColor: "#118233", // Cor de fundo do botão
      borderRadius: 8,
      padding: 12,
      alignItems: "center",
      marginBottom: 8,
    },
    modalButtonText: {
      color: "white", // Cor do texto do botão
      fontSize: 16,
      fontFamily: "rubik-regular",
    },
    modalButtonRed: {
      backgroundColor: "#771010", // Cor de fundo do botão
      borderRadius: 50,
      padding: 12,
      alignItems: "center",
      marginTop: 16,
    },
    confirmDeleteContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    confirmDeleteContent: {
      backgroundColor: "#FFF",
      padding: 20,
      borderRadius: 8,
    },
    confirmDeleteText: {
      fontSize: 18,
      marginBottom: 20,
      fontFamily: "rubik-regular",
      fontWeight: '600'
    },
    confirmDeleteButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    lyricsText: {
      fontSize: 24,
      marginBottom: 20,
      fontFamily: "rubik-regular"
    },
    musicMenuText: {
      fontSize: 18,
      fontFamily: "rubik-regular"
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: "#118233",
      borderRadius: 50,
      padding: 12
    }
  });

    export default styles;