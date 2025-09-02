use pcsc::*;
use serde::Serialize;

#[derive(Serialize)]
pub struct NfcStatus {
    pub available: bool,
    pub message: String,
}

pub fn check_nfc() -> NfcStatus {
    let ctx = Context::establish(Scope::User);
    match ctx {
        Ok(ctx) => {
            let readers = ctx.list_readers_owned();
            match readers {
                Ok(readers) if !readers.is_empty() => NfcStatus {
                    available: true,
                    message: format!("Found {} NFC reader(s)", readers.len()),
                },
                Ok(_) => NfcStatus {
                    available: false,
                    message: "No NFC readers detected".into(),
                },
                Err(e) => NfcStatus {
                    available: false,
                    message: format!("Failed to list readers: {}", e),
                },
            }
        }
        Err(e) => NfcStatus {
            available: false,
            message: format!("Failed to establish NFC context: {}", e),
        },
    }
}
