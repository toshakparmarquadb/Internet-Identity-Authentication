use candid::{CandidType, Principal};
use ic_cdk_macros::*;
use serde::Deserialize;
use std::cell::RefCell;
use std::collections::HashMap;

#[derive(Clone, Debug, CandidType, Deserialize)]
struct UserData {
    name: String,
    messages: Vec<String>,
}

thread_local! {
    static USERS: RefCell<HashMap<Principal, UserData>> = RefCell::new(HashMap::new());
}

#[update]
fn add_message(message: String) {
    let caller = ic_cdk::caller();
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let user_data = users.entry(caller).or_insert(UserData {
            name: "Anonymous".to_string(),
            messages: Vec::new(),
        });
        user_data.messages.push(message);
    });
}

#[query]
fn get_messages() -> Vec<String> {
    let caller = ic_cdk::caller();
    USERS.with(|users| {
        users
            .borrow()
            .get(&caller)
            .map(|user_data| user_data.messages.clone())
            .unwrap_or_default()
    })
}

#[update]
fn update_name(name: String) {
    let caller = ic_cdk::caller();
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let user_data = users.entry(caller).or_insert(UserData {
            name: "Anonymous".to_string(),
            messages: Vec::new(),
        });
        user_data.name = name;
    });
}