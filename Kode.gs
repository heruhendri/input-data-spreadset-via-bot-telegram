/**
 * Script Google Apps untuk menerima data pelanggan dari Bot Telegram
 * dan menyimpannya ke Google Spreadsheet.
 */

// === KONFIGURASI ===
var TELEGRAM_TOKEN = 'ISI_TOKEN_BOT_ANDA';
var SHEET_NAME = 'DataPelanggan'; // Ganti sesuai nama sheet Anda

// === WEBHOOK HANDLER ===
function doPost(e) {
    var data = JSON.parse(e.postData.contents);
    var chatId = data.message.chat.id;
    var text = data.message.text;
    var userState = getUserState(chatId);

    // Jika /start, mulai proses input
    if (text === '/start') {
        setUserState(chatId, 1, {});
        sendMessage(chatId, 'Masukkan No. (Nomor Urut):');
        return;
    }

    // Proses pertanyaan berdasarkan state
    var step = userState.step || 1;
    var answers = userState.answers || {};

    switch (step) {
        case 1:
            answers.no = text;
            sendMessage(chatId, 'Masukkan ID Order:');
            setUserState(chatId, 2, answers);
            break;
        case 2:
            answers.idOrder = text;
            sendMessage(chatId, 'Masukkan Tanggal Registrasi (YYYY-MM-DD):');
            setUserState(chatId, 3, answers);
            break;
        case 3:
            answers.tanggal = text;
            sendMessage(chatId, 'Masukkan Nama Pelanggan:');
            setUserState(chatId, 4, answers);
            break;
        case 4:
            answers.nama = text;
            sendMessage(chatId, 'Masukkan Kode ODP:');
            setUserState(chatId, 5, answers);
            break;
        case 5:
            answers.kodeODP = text;
            sendMessage(chatId, 'Masukkan Koordinat:');
            setUserState(chatId, 6, answers);
            break;
        case 6:
            answers.koordinat = text;
            sendMessage(chatId, 'Masukkan inet:');
            setUserState(chatId, 7, answers);
            break;
        case 7:
            answers.inet = text;
            sendMessage(chatId, 'Masukkan Status Pelanggan:');
            setUserState(chatId, 8, answers);
            break;
        case 8:
            answers.status = text;
            sendMessage(chatId, 'Masukkan NO WA:');
            setUserState(chatId, 9, answers);
            break;
        case 9:
            answers.nowa = text;
            sendMessage(chatId, 'Masukkan Lokasi:');
            setUserState(chatId, 10, answers);
            break;
        case 10:
            answers.lokasi = text;
            sendMessage(chatId, 'Masukkan LATITUDE:');
            setUserState(chatId, 11, answers);
            break;
        case 11:
            answers.latitude = text;
            sendMessage(chatId, 'Masukkan LONGTITUDE:');
            setUserState(chatId, 12, answers);
            break;
        case 12:
            answers.longitude = text;
            // Simpan ke Spreadsheet
            saveToSheet(answers, chatId);
            sendMessage(chatId, 'Data berhasil disimpan. Terima kasih!');
            clearUserState(chatId);
            break;
        default:
            sendMessage(chatId, 'Ketik /start untuk mulai input data.');
            clearUserState(chatId);
            break;
    }
}

// === FUNGSI SIMPAN DATA KE SHEET ===
function saveToSheet(answers, chatId) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    sheet.appendRow([
        answers.no,
        answers.idOrder,
        answers.tanggal,
        answers.nama,
        answers.kodeODP,
        answers.koordinat,
        answers.inet,
        answers.status,
        chatId,
        answers.nowa,
        answers.lokasi,
        answers.latitude,
        answers.longitude
    ]);
}

// === FUNGSI KIRIM PESAN TELEGRAM ===
function sendMessage(chat_id, text) {
    var url = 'https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage';
    var payload = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
            chat_id: chat_id,
            text: text
        })
    };
    UrlFetchApp.fetch(url, payload);
}

// === FUNGSI STATE USER (Cache di PropertiesService) ===
function getUserState(chatId) {
    var props = PropertiesService.getUserProperties();
    var state = props.getProperty('state_' + chatId);
    return state ? JSON.parse(state) : {};
}

function setUserState(chatId, step, answers) {
    var props = PropertiesService.getUserProperties();
    props.setProperty('state_' + chatId, JSON.stringify({step: step, answers: answers}));
}

function clearUserState(chatId) {
    var props = PropertiesService.getUserProperties();
    props.deleteProperty('state_' + chatId);
}