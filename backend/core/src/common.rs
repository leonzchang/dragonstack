use std::{fs, path::PathBuf};

use chrono::{DateTime, Utc};
use once_cell::sync::OnceCell;
use rand::Rng;
use serde::{Deserialize, Serialize};

pub static TRAIT_CONFIG: OnceCell<TraitsConfig> = OnceCell::new();

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TraitsConfig {
    pub types: Vec<TraitCatagory>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[warn(non_camel_case_types)]
pub enum TraitKind {
    backgroundColor,
    pattern,
    build,
    size,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TraitCatagory {
    pub kind: TraitKind,
    pub values: Vec<String>,
}

impl TraitsConfig {
    pub fn load(file_path: &PathBuf) -> anyhow::Result<Self> {
        let config_string = fs::read_to_string(file_path)?;
        Ok(toml::from_str(&config_string)?)
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TraitType {
    pub trait_type: String,
    pub trait_value: String,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Dragon {
    pub dragon_id: Option<i32>,
    pub birthdate: DateTime<Utc>,
    pub nickname: String,
    pub traits: Vec<TraitType>,
    pub generation_id: Option<i32>,
    pub is_public: bool,
    pub sale_value: i32,
    pub sire_value: i32,
}

impl Dragon {
    pub fn new(
        generation_id: Option<i32>,
        nickname: Option<String>,
        traits: Option<Vec<TraitType>>,
    ) -> Self {
        Self {
            dragon_id: None,
            birthdate: Utc::now(),
            nickname: nickname.unwrap_or_else(|| "Unnamed dragon".to_owned()),
            traits: traits.unwrap_or_else(Self::generate_random_traits),
            generation_id,
            is_public: false,
            sale_value: 0i32,
            sire_value: 0i32,
        }
    }

    fn generate_random_traits() -> Vec<TraitType> {
        let mut traits: Vec<TraitType> = Vec::new();

        TRAIT_CONFIG
            .get()
            .expect("Global trait config error")
            .types
            .iter()
            .for_each(|t| match t.kind {
                TraitKind::backgroundColor => {
                    let mut rng = rand::thread_rng();
                    let random_number = rng.gen_range(0.0..1.0);
                    let random_index = (random_number * (t.values.len() as f64)).floor() as usize;
                    traits.push(TraitType {
                        trait_type: format!("{:?}", t.kind),
                        trait_value: t.values[random_index].to_owned(),
                    });
                }
                TraitKind::build => {
                    let mut rng = rand::thread_rng();
                    let random_number = rng.gen_range(0.0..1.0);
                    let random_index = (random_number * (t.values.len() as f64)).floor() as usize;
                    traits.push(TraitType {
                        trait_type: format!("{:?}", t.kind),
                        trait_value: t.values[random_index].to_owned(),
                    });
                }
                TraitKind::pattern => {
                    let mut rng = rand::thread_rng();
                    let random_number = rng.gen_range(0.0..1.0);
                    let random_index = (random_number * (t.values.len() as f64)).floor() as usize;
                    traits.push(TraitType {
                        trait_type: format!("{:?}", t.kind),
                        trait_value: t.values[random_index].to_owned(),
                    });
                }
                TraitKind::size => {
                    let mut rng = rand::thread_rng();
                    let random_number = rng.gen_range(0.0..1.0);
                    let random_index = (random_number * (t.values.len() as f64)).floor() as usize;
                    traits.push(TraitType {
                        trait_type: format!("{:?}", t.kind),
                        trait_value: t.values[random_index].to_owned(),
                    });
                }
            });

        traits
    }
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct DragonInfo {
    pub birthdate: DateTime<Utc>,
    pub nickname: String,
    pub generation_id: Option<i32>,
    pub is_public: bool,
    pub sale_value: i32,
    pub sire_value: i32,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AccountInfo {
    pub id: i32,
    pub password_hash: String,
    pub session_id: Option<String>,
    pub balance: i32,
}
