import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Student } from "./classes";

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
    const nuovoStudente: Student = {
        matricola: "S" + randomInteger(10000, 99999),
        telefono: randomInteger(100000000, 999999999),
        annoCorso: randomInteger(1, 5),
        corsi: [],
        uid: user.uid
    }
    functions.logger.log("Nuovo utente creato!", user);

    admin.firestore().collection("students").doc(nuovoStudente.matricola).set(nuovoStudente);
});

exports.getUserFromAuthUid = functions.https.onCall(async (data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    functions.logger.log("E' stato richiesto l'utente per l'uid: " + uid);

    const student = await admin.firestore().collection("students").where("uid", "==", uid).get();

    const response = student.docs.map(doc => doc.data())[0];

    functions.logger.log("Studente trovato: ", response);
    return response

});

exports.addUserFeedback = functions.https.onCall((data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";
    const feedback = data.feedback as string;
    const matricola = data.matricola as string;

    if (feedback == null || feedback.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a non-empty feedback");
    }

    if (matricola == null || matricola.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a non-empty 'matricola'");
    }


    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    functions.logger.log("Aggiungo un nuovo feedback: " + feedback)
    functions.logger.log("Per l'utente: " + uid + " con matricola: " + matricola);

    admin.firestore().collection("feedbacks").doc(matricola).set({
        feedback: admin.firestore.FieldValue.arrayUnion(feedback)
    }, { merge: true })
});

exports.getCoursesFromCoursesId = functions.https.onCall(async (data, context) => {
    functions.logger.log("getCoursesFromCoursesId")
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";
    // Mi servirebbe anche la matricola per fare un double-check che i corsi richiesti siano effettivamente 
    // i corsi a cui quella matricola è iscritta...
    const corsi = data.corsi as string[];

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    if (corsi == null) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with at least one course");
    }

    functions.logger.log("Richiesta di tutti i corsi per l'utente: " + uid);

    const corsiUtente = await admin.firestore().collection("courses").where("id", "array-contains-any", corsi).get();

    const response = corsiUtente.docs.map(doc => doc.data())

    functions.logger.log("Corsi trovati: ", response);

    return response;
});

exports.addCourseToStudent = functions.https.onCall((data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";

    const idCorso = data.courseId as string;
    const matricola = data.matricola as string;

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    admin.firestore().collection("students").doc(matricola).set({
        corsi: admin.firestore.FieldValue.arrayUnion(idCorso)
    }, { merge: true })

});

exports.removeCourseFromStudent = functions.https.onCall(async (data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";

    // const idCorso = data.courseId as string;
    const matricola = data.matricola as string;

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    const corsiMatricola = await admin.firestore().collection("students").where("matricola", "==", matricola).get();

    corsiMatricola.docs.forEach(d => {
        functions.logger.log("Attempting to delete: ", d)
    });

});

exports.getAllStudentCourse = functions.https.onCall(async (data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";
    const matricola = data.matricola as string;

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    const dbRef = await admin.firestore().collection("students").where("matricola", "==", matricola).get();
        
    const response = dbRef.docs.map(doc => doc.data());

    functions.logger.log("Corsi trovati: " + response + " per l'utente con matricola: " + matricola);
    return response;
});


/**
 * Returns an integer random number between min (included) and max (included)
 */
export function randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};



