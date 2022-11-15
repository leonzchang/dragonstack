use crate::common::{Dragon, TraitType};

use rand::Rng;

pub struct Breeder;

impl Breeder {
    pub fn breeder_dragon(matron: Dragon, patron: Dragon) -> anyhow::Result<Dragon> {
        let matron_traits = matron.traits;
        let patron_traits = patron.traits;
        let mut baby_traits: Vec<TraitType> = Vec::new();

        for mt in matron_traits {
            let matron_trait_value = mt.trait_value;
            let Some(patron_trait) = patron_traits
                .iter()
                .find(|pt| pt.trait_type == mt.trait_type) else {return Err(anyhow::anyhow!("breed dragon trait type not found."))};

            baby_traits.push(TraitType {
                trait_type: mt.trait_type,
                trait_value: Self::pick_trait(
                    matron_trait_value,
                    patron_trait.trait_value.to_owned(),
                ),
            })
        }

        Ok(Dragon::new(
            None,
            Some("Unnamed baby".to_owned()),
            Some(baby_traits),
        ))
    }

    // Two incoming traits: matronTrait and patronTrait
    // The matronTrait and patronTrait string values are encoded.
    // Both traits have their characters summed.
    // Get a range by adding both character sums.
    // Generate a random number, in that range.
    // If the number is less than the matron's character sum, pick matron.
    // Else, pick patron.
    fn pick_trait(matron_trait_value: String, patron_trait_value: String) -> String {
        if matron_trait_value == patron_trait_value {
            return matron_trait_value;
        }

        let matron_trait_char_sum = Self::char_sum(base64::encode(&matron_trait_value));
        let patron_trait_char_sum = Self::char_sum(base64::encode(&patron_trait_value));

        let mut rng = rand::thread_rng();
        let random = rng.gen_range(0.0..1.0);
        let random_number =
            (random * (matron_trait_char_sum + patron_trait_char_sum) as f32).floor() as u32;

        if random_number < matron_trait_char_sum {
            return matron_trait_value;
        } else {
            return patron_trait_value;
        }
    }

    fn char_sum(s: String) -> u32 {
        s.as_bytes().iter().map(|&b| b as u32).sum()
    }
}
