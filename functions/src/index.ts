import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

/**
 * Function called when a new user sign up
 */
exports.newUserSignup = functions.auth.user().onCreate((user) => {
    const nuovoStudente: Studente = {
        matricola: "S" + randomInteger(10000, 99999),
        telefono: randomInteger(100000000, 999999999),
        annoCorso: randomInteger(1, 5)
    }
    console.log("Nuovo utente creato!", user.email);
    console.log("Matricola assegnata: " + nuovoStudente.matricola);
    console.log("Numero di telefono generato: " + nuovoStudente.telefono);
    console.log("Anno corso: " + nuovoStudente.annoCorso);

    admin.firestore().collection("studenti").doc(user.uid).set(nuovoStudente);
});

exports.addUserFeedback = functions.https.onCall(async (data, context) => {
    const uid = context.auth?.uid;
    const feedback = data.feedback;

    return admin.database().ref("/feedbacks").push({
        feedback: feedback,
        author: uid
    }).then(() => {
        console.log("Feedback received", feedback);
    }).catch((error) => {
        throw new functions.https.HttpsError("aborted", error.message, error);
    })
});

/**
 * Returns an integer random number between min (included) and max (included)
 */
export function randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export class Studente {
    matricola!: string;
    telefono!: number;
    annoCorso!: number;
}