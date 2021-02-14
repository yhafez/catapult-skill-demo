//  ./index.test.js

const dotenv = require("dotenv").config();
const fetch = require("node-fetch");

const BASE_URL = "https://dictionary.iachieved.it/dictionary";
const REQUEST_HEADER = process.env.REQUEST_HEADER;
const UNAUTHORIZED_HEADER = process.env.REQUEST_HEADER + "invalid";
const MALFORMED_HEADER = "malformed";

// If fetch API is not available (such as in Node), add "node-fetch" NPM package's fetch functionality to the global namespace
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

let successfulCreateReqResponse,
    successfulCreateReqData,
    unathorizedPostResponse,
    malformedAuthPostResponse,
    missingAuthPostResponse;

let successfulDeleteResponse1,
    successfulDeleteResponse2,
    unathorizedDeleteResponse,
    malformedAuthDeleteResponse,
    missingAuthDeleteResponse;

let successfulModifyKeyResponse;

// To avoid making http requests for every test, perform all desired fetch calls before executing any tests
beforeAll(async () => {
    successfulCreateReqResponse = await fetch(BASE_URL, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: REQUEST_HEADER,
        },
        body: {
            test: "TEST",
        },
    });
    successfulCreateReqData = await successfulCreateReqResponse.json();

    unathorizedPostResponse = await fetch(BASE_URL, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: UNAUTHORIZED_HEADER,
        },
        body: {
            test: "TEST",
        },
    });
    malformedAuthPostResponse = await fetch(BASE_URL, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: MALFORMED_HEADER,
        },
        body: {
            test: "TEST",
        },
    });
    missingAuthPostResponse = await fetch(BASE_URL, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: {
            test: "TEST",
        },
    });

    successfulModifyKeyResponse = await fetch(
        `${BASE_URL}/${successfulCreateReqData.id}/keys/test?id=${successfulCreateReqData.id}`,
        {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Authorization: REQUEST_HEADER,
            },
            body: {
                test: "new value",
            },
        }
    );

    // The difference between 1 and 2 is in the API route. The 1st uses the format I understood from the documentation. The 2nd uses the format automatically generated when using the console GUI in the documentation. Neither worked for me as expected.

    successfulDeleteResponse1 = await fetch(
        `${BASE_URL}/${successfulCreateReqData.id}`,
        {
            method: "delete",
            headers: {
                "Content-Type": "application/json",
                Authorization: REQUEST_HEADER,
            },
        }
    );

    successfulDeleteResponse2 = await fetch(
        `${BASE_URL}/${successfulCreateReqData.id}?id=${successfulCreateReqData.id}`,
        {
            method: "delete",
            headers: {
                "Content-Type": "application/json",
                Authorization: REQUEST_HEADER,
            },
        }
    );

    unathorizedDeleteResponse = await fetch(
        `${BASE_URL}/${successfulCreateReqData.id}`,
        {
            method: "delete",
            headers: {
                "Content-Type": "application/json",
                Authorization: UNAUTHORIZED_HEADER,
            },
        }
    );

    malformedAuthDeleteResponse = await fetch(
        `${BASE_URL}/${successfulCreateReqData.id}`,
        {
            method: "delete",
            headers: {
                "Content-Type": "application/json",
                Authorization: MALFORMED_HEADER,
            },
        }
    );

    missingAuthDeleteResponse = await fetch(
        `${BASE_URL}/${successfulCreateReqData.id}`,
        {
            method: "delete",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
});

describe("successful POST requests to API at BASE_URL", () => {
    it("returns a status code of 201", async () =>
        expect(successfulCreateReqResponse.status).toBe(201));
    it("returns an object", async () =>
        expect(typeof successfulCreateReqData).toBe("object"));
    test("the object contains an id key", () =>
        expect(successfulCreateReqData).toHaveProperty("id"));
    test("the value of the id property is a string", () =>
        expect(typeof successfulCreateReqData.id).toBe("string"));
    test("the string is 36 characters", () =>
        expect(successfulCreateReqData.id.length).toBe(36));
});

describe("unaturhorized POST requests to API at BASE_URL", () => {
    it("returns a status code of 401 if authorization starts with correct prefix, but is followed by a missing or incorrect hash", async () =>
        expect(unathorizedPostResponse.status).toBe(401));
    it("returns a status code of 401 if authorization is missing", async () =>
        expect(missingAuthPostResponse.status).toBe(401));
    it("returns a status code of 400 if authorization is malformed", async () =>
        expect(malformedAuthPostResponse.status).toBe(400));
});

describe("successful DELETE requests to API at BASE_URL/[id]", () => {
    it("returns a status code of 200", () => {
        expect(successfulDeleteResponse1.status).toBe(200);
    });
    it("returns a status code of 200", () => {
        expect(successfulDeleteResponse2.status).toBe(200);
    });
});

describe("unauthorized DELETE requests to API at BASE_URL/[id]", () => {
    it("returns a status code of 401 if authroization key is incorrect", () => {
        expect(unathorizedDeleteResponse.status).toBe(401);
    });
    it("returns a status code of 401 if authorization key is malformed", () => {
        expect(malformedAuthDeleteResponse.status).toBe(401);
    });
    it("returns a status code of 401 if authorization key is missing", () => {
        expect(missingAuthDeleteResponse.status).toBe(401);
    });
});

describe("successful POST requests to API at BASE_URL/[id]/keys/[key]", () => {
    it("returns a status code of 201", () => {
        expect(successfulModifyKeyResponse.status).toBe(201);
    });
});
