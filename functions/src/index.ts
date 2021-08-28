import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Student } from "./classes";
import { AddOrRemoveCourseToStudentRequestDto, AddUserFeedbackRequestDto, GetAllUserCoursesDto } from "./dtos";
import { firestore } from "firebase-admin";

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
        telefono: randomInteger(300000000, 999999999),
        annoCorso: randomInteger(1, 5),
        corsi: [],
        situazioneTasse: Math.random() < 0.8,
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

exports.addUserFeedback = functions.https.onCall((data: AddUserFeedbackRequestDto, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";
    const feedback = data.feedback;
    const matricola = data.matricola;

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

exports.getCoursesFromCoursesId = functions.https.onCall(async (data: string[], context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";
    const corsi = data;

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    if (corsi == null) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with at least one course");
    }

    functions.logger.log("Richiesta di tutti i corsi per l'utente: " + uid);
    functions.logger.log("I corsi a cui l'utente è iscritto sono: ", corsi)

    const querySnapshot: firestore.QuerySnapshot<firestore.DocumentData>[] = [];
    const listaCorsi: firestore.DocumentData[] = [];

    for (const corso of corsi) {
        functions.logger.log("Corso da ottenere: ", corso)
        await admin.firestore().collection("courses").where("id", "==", corso).get().then(result => {
            querySnapshot.push(result)
            }
        )
    }

    querySnapshot.forEach(element => {
        functions.logger.log("Element: ", element)
        element.docs.map(d => {
            functions.logger.log("Corso in lettura: ", d.data())
            listaCorsi.push(d.data())
        });
    });

    functions.logger.log("Corsi ottenuti: ", listaCorsi)

    return listaCorsi;
});

exports.getTeachers = functions.https.onCall(async (data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    
    const teachers = await admin.firestore().collection("teachers").get();

    const response: firestore.DocumentData[] = [];
    
    teachers.docs.map(doc => 
        response.push(doc.data())
    );

    functions.logger.log("Professori ottenuti", response)

    return response
});

exports.getLessons = functions.https.onCall(async (data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    
    const lessons = await admin.firestore().collection("lessons").get();

    const response: firestore.DocumentData[] = [];
    
    lessons.docs.map(doc => 
        response.push(doc.data())
    );

    functions.logger.log("Lezioni ottenute", response)

    return response
});

exports.getCourses = functions.https.onCall(async (data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    
    const courses = await admin.firestore().collection("courses").get();

    const response: firestore.DocumentData[] = [];
    
    courses.docs.map(doc => 
        response.push(doc.data())
    );

    functions.logger.log("Corsi ottenuti", response)

    return response
});




exports.addCourseToStudent = functions.https.onCall((data: AddOrRemoveCourseToStudentRequestDto, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";

    const idCorso = data.idCorso;
    const matricola = data.matricola;

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    admin.firestore().collection("students").doc(matricola).set({
        corsi: admin.firestore.FieldValue.arrayUnion(idCorso)
    }, { merge: true })

});

exports.removeCourseFromStudent = functions.https.onCall(async (data: AddOrRemoveCourseToStudentRequestDto, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";

    const idCorso = data.idCorso;
    const matricola = data.matricola;

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    const corsiMatricola = await admin.firestore().collection("students").where("matricola", "==", matricola).get();
    
    functions.logger.log("Corsi matricola trovati:", corsiMatricola)
    functions.logger.log("Corso da rimuovere:", idCorso)

    admin.firestore().collection("students").doc(matricola).set({
        corsi: admin.firestore.FieldValue.arrayRemove(idCorso)
    }, { merge: true })
});

exports.getAllStudentCourse = functions.https.onCall(async (data: GetAllUserCoursesDto, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";
    const matricola = data.matricola;

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    const dbRef = await admin.firestore().collection("students").where("matricola", "==", matricola).get();
        
    const response = dbRef.docs.map(doc => doc.data());

    functions.logger.log("Corsi trovati: " + response + " per l'utente con matricola: " + matricola);
    return response;
});

exports.getCalendarLessons = functions.https.onCall(async (data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const uid = context.auth?.uid || "";

    if (uid === "") {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid auth uid");
    }

    const dbRef = await admin.firestore().collection("calendar_lessons").get();
        
    const response = dbRef.docs.map(doc => doc.data())[0]["lessons"];

    functions.logger.log("Lezioni trovate: ", response);
    return response;
});


/**
 * Returns an integer random number between min (included) and max (included)
 */
export function randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};



