"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ai_1 = require("ai");
var google_1 = require("@ai-sdk/google");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
// Read .env.local manually
var envPath = path_1.default.resolve('.env.local');
var envContent = fs_1.default.readFileSync(envPath, 'utf-8');
var apiKey = '';
for (var _i = 0, _a = envContent.split('\n'); _i < _a.length; _i++) {
    var line = _a[_i];
    if (line.startsWith('GEMINI_API_KEY=')) {
        apiKey = line.split('=')[1].trim();
    }
}
var aiClient = (0, google_1.createGoogleGenerativeAI)({
    apiKey: apiKey,
});
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var prompt, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "You are a CS professor evaluating whether a student TRULY UNDERSTANDS their code. You're not trying to extract the perfect answer \u2014 you're checking if they grasp what they wrote.\n\nThis is a [**BEGINNER**] level question. Adjust your expectations accordingly:\n- Be extremely forgiving with terminology as long as the core concept is correct.\n\nQUESTION: Hi there! Thanks for sharing your `greet` function. It's a clear way to construct a greeting string. I have a question about the very last line of your snippet: `print(greet(\"World\"))`. Can you explain why this line, as it's currently placed, will never actually execute? What would you need to change to make it run?\n\nCODE:\ndef greet(name):\n    return f\"Hello, {name}!\"\n    \n    print(greet(\"World\"))\n\nSTUDENT'S ANSWER: This function takes a name parameter and returns a formatted greeting string using an f-string. When called with World it prints Hello World.\n\nReturn EXACTLY the following XML format (do not use markdown blocks):\n<evaluation>\n  <score>number (0-100)</score>\n  <feedback>your feedback here</feedback>\n</evaluation>";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log("Calling Gemini via Vercel AI SDK...");
                    return [4 /*yield*/, (0, ai_1.generateText)({
                            model: aiClient('gemini-2.5-flash'),
                            prompt: prompt,
                            temperature: 0.3,
                            // @ts-ignore
                            maxTokens: 1000,
                        })];
                case 2:
                    result = _a.sent();
                    console.log("------------------- SDK RESULT -------------------");
                    console.log("TEXT:\n" + result.text);
                    console.log("\nFINISH REASON:", result.finishReason);
                    console.log("------------------------------------------------");
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error(err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
main();
