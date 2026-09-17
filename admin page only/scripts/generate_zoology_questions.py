import json

zoology_questions = [
  {
    "id": 1,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Animal Kingdom > Basis of Classification",
    "question": "Which of the following animals exhibits radial symmetry and diploblastic body organisation?",
    "diagram": None,
    "options": {
      "a": "Ascaris (Nematoda)",
      "b": "Taenia (Platyhelminthes)",
      "c": "Aurelia (Cnidaria)",
      "d": "Pila (Mollusca)"
    },
    "correctAnswer": "c",
    "explanation": "Cnidarians (e.g., Aurelia/Jellyfish) and Ctenophores exhibit radial symmetry and possess a diploblastic body organisation with outer ectoderm and inner endoderm separated by mesoglea.",
    "expDiagram": None
  },
  {
    "id": 2,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Animal Kingdom > Non-Chordates",
    "question": "Metagenesis (alternation of generations between polyp and medusa) is characteristically observed in:",
    "diagram": None,
    "options": {
      "a": "Obelia",
      "b": "Hydra",
      "c": "Physalia",
      "d": "Adamsia"
    },
    "correctAnswer": "a",
    "explanation": "Obelia shows metagenesis where the sessile polyp produces free-swimming medusae asexually, and medusae produce polyps sexually.",
    "expDiagram": None
  },
  {
    "id": 3,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Animal Kingdom > Phylum Arthropoda",
    "question": "In which of the following phyla are Malpighian tubules present as the principal excretory structures?",
    "diagram": None,
    "options": {
      "a": "Annelida",
      "b": "Arthropoda",
      "c": "Mollusca",
      "d": "Echinodermata"
    },
    "correctAnswer": "b",
    "explanation": "Malpighian tubules are characteristic excretory and osmoregulatory structures found in terrestrial arthropods such as insects (Cockroach).",
    "expDiagram": None
  },
  {
    "id": 4,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Animal Kingdom > Chordata",
    "question": "Match List-I with List-II:\nList-I (Animal)       List-II (Respiratory Organ)\n(A) Prawn             (I) Tracheal system\n(B) Cockroach         (II) Book lungs\n(C) Scorpion          (III) Gills\n(D) Earthworm         (IV) Moist cuticle\nChoose the correct option:",
    "diagram": None,
    "options": {
      "a": "A-(III), B-(I), C-(II), D-(IV)",
      "b": "A-(IV), B-(I), C-(II), D-(III)",
      "c": "A-(III), B-(II), C-(I), D-(IV)",
      "d": "A-(I), B-(III), C-(IV), D-(II)"
    },
    "correctAnswer": "a",
    "explanation": "Prawn respires through gills, Cockroach through tracheal system, Scorpion through book lungs, and Earthworm through moist skin/cuticle.",
    "expDiagram": None
  },
  {
    "id": 5,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Structural Organisation in Animals > Animal Tissues",
    "question": "Cuboidal epithelium with a brush border of microvilli is characteristically located in:",
    "diagram": None,
    "options": {
      "a": "Proximal convoluted tubule (PCT) of nephron",
      "b": "Eustachian tube",
      "c": "Lining of intestine",
      "d": "Ducts of salivary glands"
    },
    "correctAnswer": "a",
    "explanation": "Simple cuboidal epithelium with dense microvilli forming a brush border lines the proximal convoluted tubule (PCT) of the nephron, greatly expanding absorptive surface area.",
    "expDiagram": None
  },
  {
    "id": 6,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Structural Organisation in Animals > Cell Junctions",
    "question": "Cell junctions that adhere neighbouring cells together and facilitate rapid transfer of ions and small molecules between adjacent cells are:",
    "diagram": None,
    "options": {
      "a": "Tight junctions and Desmosomes",
      "b": "Gap junctions",
      "c": "Adhering junctions only",
      "d": "Tight junctions only"
    },
    "correctAnswer": "b",
    "explanation": "Gap junctions facilitate rapid intercellular communication by directly coupling the cytoplasm of adjacent cells for immediate ion and small metabolite flux.",
    "expDiagram": None
  },
  {
    "id": 7,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Breathing and Exchange of Gases > Pulmonary Volumes",
    "question": "Total volume of air a person can expire after a normal inspiration (Tidal Volume + Expiratory Reserve Volume) is termed:",
    "diagram": None,
    "options": {
      "a": "Vital Capacity (VC)",
      "b": "Functional Residual Capacity (FRC)",
      "c": "Expiratory Capacity (EC)",
      "d": "Inspiratory Capacity (IC)"
    },
    "correctAnswer": "c",
    "explanation": "Expiratory Capacity (EC) = TV + ERV. It is the maximum volume of air a person can exhale after a normal tidal inhalation.",
    "expDiagram": None
  },
  {
    "id": 8,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Breathing and Exchange of Gases > Gas Transport",
    "question": "A shift in the oxygen-haemoglobin dissociation curve to the right is triggered by:",
    "diagram": None,
    "options": {
      "a": "Low pCO2 and high pH",
      "b": "High pCO2, elevated H+ concentration (acidic pH), and higher temperature",
      "c": "Low H+ concentration and low temperature",
      "d": "High pO2 and low body temperature"
    },
    "correctAnswer": "b",
    "explanation": "The Bohr effect shifts the oxygen-haemoglobin dissociation curve to the right due to elevated pCO2, elevated H+ concentration (lower pH), and elevated temperature, decreasing Hb affinity for O2 and promoting O2 release into metabolizing tissues.",
    "expDiagram": None
  },
  {
    "id": 9,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Body Fluids and Circulation > Blood Components",
    "question": "Which granulocyte secretes histamine, serotonin, and heparin, actively participating in inflammatory and allergic responses?",
    "diagram": None,
    "options": {
      "a": "Neutrophils",
      "b": "Eosinophils",
      "c": "Basophils",
      "d": "Monocytes"
    },
    "correctAnswer": "c",
    "explanation": "Basophils contain granules rich in histamine, heparin, and serotonin, and play a crucial role in inflammatory reactions and allergic responses.",
    "expDiagram": None
  },
  {
    "id": 10,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Body Fluids and Circulation > Cardiac Cycle & ECG",
    "question": "In a standard human Electrocardiogram (ECG), the QRS complex represents:",
    "diagram": None,
    "options": {
      "a": "Depolarisation of the atria",
      "b": "Depolarisation of the ventricles",
      "c": "Repolarisation of the ventricles",
      "d": "End of ventricular systole"
    },
    "correctAnswer": "b",
    "explanation": "The QRS complex represents the rapid ventricular depolarisation that triggers ventricular contraction (systole).",
    "expDiagram": None
  },
  {
    "id": 11,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Body Fluids and Circulation > Vascular System",
    "question": "The hepatic portal vein carries blood from:",
    "diagram": None,
    "options": {
      "a": "Liver to Inferior Vena Cava",
      "b": "Gut (gastrointestinal tract) to Liver",
      "c": "Kidneys to Liver",
      "d": "Heart to Liver"
    },
    "correctAnswer": "b",
    "explanation": "The hepatic portal system drains nutrient-rich venous blood from the stomach, pancreas, and intestine into the liver via the hepatic portal vein before entering systemic circulation.",
    "expDiagram": None
  },
  {
    "id": 12,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Excretory Products and their Elimination > Nephron Physiology",
    "question": "Podocytes, or specialized visceral epithelial cells, are located in:",
    "diagram": None,
    "options": {
      "a": "Inner wall of Bowman's capsule",
      "b": "Lining of loop of Henle",
      "c": "Outer wall of glomerulus only",
      "d": "Wall of collecting duct"
    },
    "correctAnswer": "a",
    "explanation": "Podocytes are specialized visceral epithelial cells covering the inner wall of Bowman's capsule that form filtration slits (slit pores) around glomerular capillaries.",
    "expDiagram": None
  },
  {
    "id": 13,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Excretory Products and their Elimination > Counter-Current Mechanism",
    "question": "The primary driving force establishing a hyperosmotic medullary gradient in the human kidney is:",
    "diagram": None,
    "options": {
      "a": "Permeability of ascending limb of loop of Henle to water",
      "b": "Counter-current multiplier between Loop of Henle and Vasa Recta with NaCl and Urea cycling",
      "c": "Active secretion of potassium in PCT",
      "d": "Filtration pressure generated in glomerulus alone"
    },
    "correctAnswer": "b",
    "explanation": "The counter-current mechanism involving Henle's loop and vasa recta creates an increasing medullary interstitial osmolarity (from 300 to 1200 mOsmol/L) through transport of NaCl and urea.",
    "expDiagram": None
  },
  {
    "id": 14,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Locomotion and Movement > Muscle Contraction",
    "question": "During skeletal muscle contraction according to the sliding filament model, which zone/band remains constant in width?",
    "diagram": None,
    "options": {
      "a": "I-band",
      "b": "H-zone",
      "c": "A-band",
      "d": "Distance between consecutive Z-lines"
    },
    "correctAnswer": "c",
    "explanation": "During sarcomere contraction, the A-band (anisotropic band containing full length of thick myosin filaments) retains its constant width, while the I-band and H-zone shorten.",
    "expDiagram": None
  },
  {
    "id": 15,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Locomotion and Movement > Skeletal System",
    "question": "The joint between the atlas vertebra and the axis vertebra is classified as a:",
    "diagram": None,
    "options": {
      "a": "Hinge joint",
      "b": "Pivot joint",
      "c": "Gliding joint",
      "d": "Saddle joint"
    },
    "correctAnswer": "b",
    "explanation": "The atlanto-axial articulation is a synovial pivot joint allowing rotational movement of the head (nodding/shaking 'no').",
    "expDiagram": None
  },
  {
    "id": 16,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Neural Control and Coordination > Action Potential",
    "question": "Depolarisation of the axolemma during the transmission of a nerve impulse occurs due to rapid influx of:",
    "diagram": None,
    "options": {
      "a": "K+ ions into the axoplasm",
      "b": "Na+ ions into the axoplasm",
      "c": "Cl- ions into the axoplasm",
      "d": "Ca2+ ions out of the axoplasm"
    },
    "correctAnswer": "b",
    "explanation": "When a threshold stimulus arrives, voltage-gated Na+ channels open, allowing rapid influx of Na+ into the axoplasm, flipping resting membrane potential from -70 mV to positive values (depolarisation).",
    "expDiagram": None
  },
  {
    "id": 17,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Neural Control and Coordination > Central Nervous System",
    "question": "The canal passing through the midbrain connecting the third and fourth ventricles is called:",
    "diagram": None,
    "options": {
      "a": "Foramen of Monro",
      "b": "Cerebral aqueduct (Aqueduct of Sylvius)",
      "c": "Corpus callosum",
      "d": "Central canal of spinal cord"
    },
    "correctAnswer": "b",
    "explanation": "A slender channel called the cerebral aqueduct (aqueduct of Sylvius) runs longitudinally through the midbrain and links the third ventricle to the fourth ventricle.",
    "expDiagram": None
  },
  {
    "id": 18,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Chemical Coordination and Integration > Thyroid Hormones",
    "question": "Deficiency of iodine in the human diet impairs synthesis of thyroid hormones and leads to enlargement of the gland known as:",
    "diagram": None,
    "options": {
      "a": "Cushing's syndrome",
      "b": "Exophthalmic goitre",
      "c": "Simple endemic goitre",
      "d": "Addison's disease"
    },
    "correctAnswer": "c",
    "explanation": "Dietary iodine deficiency impairs T3 and T4 synthesis, causing prolonged TSH stimulation and thyroid gland hypertrophy known as endemic goitre.",
    "expDiagram": None
  },
  {
    "id": 19,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Chemical Coordination and Integration > Endocrine Mechanisms",
    "question": "Which of the following peptide hormones stimulates gluconeogenesis, glycogenolysis, and reduces cellular glucose uptake?",
    "diagram": None,
    "options": {
      "a": "Insulin",
      "b": "Glucagon",
      "c": "Oxytocin",
      "d": "Melatonin"
    },
    "correctAnswer": "b",
    "explanation": "Glucagon is secreted by alpha cells of the Islets of Langerhans; it is a hyperglycaemic hormone promoting glycogen breakdown and gluconeogenesis in hepatocytes.",
    "expDiagram": None
  },
  {
    "id": 20,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Human Reproduction > Male Reproductive System",
    "question": "Sertoli cells present in the seminiferous tubules provide:",
    "diagram": None,
    "options": {
      "a": "Testosterone secretion",
      "b": "Nutrition and mechanical support to differentiating spermatogenic cells",
      "c": "Luteinizing hormone synthesis",
      "d": "Fructose and prostaglandins secretion"
    },
    "correctAnswer": "b",
    "explanation": "Sertoli cells (sustentacular cells) nurse developing spermatocytes through spermatogenesis and secrete inhibin and androgen-binding protein (ABP).",
    "expDiagram": None
  },
  {
    "id": 21,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Human Reproduction > Menstrual Cycle",
    "question": "Ovulation in the human female menstrual cycle is triggered by a sudden mid-cycle peak in:",
    "diagram": None,
    "options": {
      "a": "Progesterone",
      "b": "Luteinizing Hormone (LH surge)",
      "c": "Prolactin",
      "d": "Oxytocin"
    },
    "correctAnswer": "b",
    "explanation": "High levels of estrogen induce a massive positive-feedback release of Luteinizing Hormone (LH surge) around day 14, causing rupture of the Graafian follicle and release of the secondary oocyte.",
    "expDiagram": None
  },
  {
    "id": 22,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Human Reproduction > Fertilisation & Cleavage",
    "question": "Capacitation of human sperm occurs inside the:",
    "diagram": None,
    "options": {
      "a": "Epididymis",
      "b": "Female reproductive tract (uterus and fallopian tubes)",
      "c": "Seminiferous tubules",
      "d": "Vas deferens"
    },
    "correctAnswer": "b",
    "explanation": "Capacitation is the physiological conditioning of spermatozoa that occurs in the secretions of the female reproductive tract, removing surface glycoproteins and cholesterol from the acrosome.",
    "expDiagram": None
  },
  {
    "id": 23,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Reproductive Health > Contraceptive Methods",
    "question": "Copper ions released by copper-releasing Intrauterine Devices (e.g. CuT, Cu7, Multiload 375):",
    "diagram": None,
    "options": {
      "a": "Inhibit ovulation completely",
      "b": "Suppress sperm motility and fertilising capacity",
      "c": "Prevent cleavage of blastocyst",
      "d": "Thicken cervical mucus exclusively"
    },
    "correctAnswer": "b",
    "explanation": "Copper ions (Cu2+) released into uterine fluid exert a toxic effect on spermatozoa, suppressing their motility and viability and impeding fertilisation.",
    "expDiagram": None
  },
  {
    "id": 24,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Reproductive Health > Assisted Reproductive Technologies (ART)",
    "question": "In vitro fertilisation followed by transfer of an embryo up to 8 blastomeres into the fallopian tube is designated as:",
    "diagram": None,
    "options": {
      "a": "IUT (Intra-Uterine Transfer)",
      "b": "ZIFT (Zygote Intra-Fallopian Transfer)",
      "c": "GIFT (Gamete Intra-Fallopian Transfer)",
      "d": "ICSI (Intra-Cytoplasmic Sperm Injection)"
    },
    "correctAnswer": "b",
    "explanation": "Transfer of zygote or early embryo (up to 8 blastomeres) directly into the fallopian tube is termed Zygote Intra-Fallopian Transfer (ZIFT).",
    "expDiagram": None
  },
  {
    "id": 25,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Evolution > Origin of Life",
    "question": "In the classic Miller-Urey experiment (1953), which gaseous mixture and conditions simulated primitive Earth atmosphere?",
    "diagram": None,
    "options": {
      "a": "CH4, NH3, H2 and H2O vapour at 800°C with electric discharge",
      "b": "CH4, CO2, N2 and H2O at 100°C",
      "c": "NH3, O2, H2 and CH4 at 500°C",
      "d": "CO2, H2, O2 and He at 1000°C"
    },
    "correctAnswer": "a",
    "explanation": "Stanley Miller created electric discharge in a closed flask containing CH4, H2, NH3 and water vapour at 800°C, observing synthesis of amino acids (glycine, alanine, aspartic acid).",
    "expDiagram": None
  },
  {
    "id": 26,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Evolution > Homologous & Analogous Organs",
    "question": "The wings of a butterfly and the wings of a bird exemplify:",
    "diagram": None,
    "options": {
      "a": "Homologous structures arising from divergent evolution",
      "b": "Analogous structures arising from convergent evolution",
      "c": "Atavistic traits",
      "d": "Vestigial organs"
    },
    "correctAnswer": "b",
    "explanation": "Wings of birds and insects share similar flying function but have different embryonic origins and anatomical architecture, illustrating convergent evolution (analogous organs).",
    "expDiagram": None
  },
  {
    "id": 27,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Evolution > Hardy-Weinberg Principle",
    "question": "In a population at genetic equilibrium under Hardy-Weinberg conditions, if the frequency of a recessive allele (q) is 0.4, what is the percentage of heterozygous carriers (2pq)?",
    "diagram": None,
    "options": {
      "a": "48%",
      "b": "16%",
      "c": "36%",
      "d": "24%"
    },
    "correctAnswer": "a",
    "explanation": "p + q = 1, so p = 1 - 0.4 = 0.6. The frequency of heterozygotes is 2pq = 2 * (0.6) * (0.4) = 0.48 (48%).",
    "expDiagram": None
  },
  {
    "id": 28,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Human Health and Disease > Immunity",
    "question": "Which immunoglobulin isotope is the most abundant in maternal colostrum, providing immediate mucosal passive immunity to the newborn?",
    "diagram": None,
    "options": {
      "a": "IgG",
      "b": "IgM",
      "c": "IgA",
      "d": "IgE"
    },
    "correctAnswer": "c",
    "explanation": "Secretory IgA is the chief antibody in human colostrum and breast milk, guarding the infant's digestive and mucosal tract against pathogens.",
    "expDiagram": None
  },
  {
    "id": 29,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Human Health and Disease > Infectious Pathogens",
    "question": "Match the pathogen with its respective disease:\n(A) Salmonella typhi       (I) Elephantiasis (Filariasis)\n(B) Wuchereria bancrofti   (II) Amoebic dysentery\n(C) Entamoeba histolytica  (III) Typhoid fever\n(D) Plasmodium falciparum  (IV) Malignant malaria\nChoose the correct code:",
    "diagram": None,
    "options": {
      "a": "A-(III), B-(I), C-(II), D-(IV)",
      "b": "A-(III), B-(IV), C-(I), D-(II)",
      "c": "A-(I), B-(III), C-(II), D-(IV)",
      "d": "A-(IV), B-(I), C-(III), D-(II)"
    },
    "correctAnswer": "a",
    "explanation": "Salmonella typhi causes typhoid; Wuchereria bancrofti causes elephantiasis; Entamoeba causes amoebiasis; Plasmodium falciparum causes malignant tertian malaria.",
    "expDiagram": None
  },
  {
    "id": 30,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Human Health and Disease > Oncology",
    "question": "Malignant tumours differ essentially from benign tumours due to their capability of:",
    "diagram": None,
    "options": {
      "a": "Remaining confined to original anatomical site",
      "b": "Metastasis (secondary invasiveness into distant organs via blood and lymph)",
      "c": "Contact inhibition",
      "d": "Encapsulation by fibrous sheath"
    },
    "correctAnswer": "b",
    "explanation": "Metastasis is the most feared and distinctive property of malignant tumours, whereby cancer cells detach and colonise distant organs.",
    "expDiagram": None
  },
  {
    "id": 31,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Human Health and Disease > Autoimmunity",
    "question": "Which of the following is a classic autoimmune disorder where the immune system attacks self-antigens at the neuromuscular junction, leading to progressive muscle fatigue and paralysis?",
    "diagram": None,
    "options": {
      "a": "Muscular dystrophy",
      "b": "Myasthenia gravis",
      "c": "Osteoarthritis",
      "d": "Tetany"
    },
    "correctAnswer": "b",
    "explanation": "Myasthenia gravis is an autoimmune disease where autoantibodies block or destroy nicotinic acetylcholine receptors at the neuromuscular junction.",
    "expDiagram": None
  },
  {
    "id": 32,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Biotechnology and Its Applications > Transgenic Organisms",
    "question": "Rosie, the first transgenic cow created in 1997, produced human protein-enriched milk containing:",
    "diagram": None,
    "options": {
      "a": "Human alpha-lactalbumin",
      "b": "Human insulin",
      "c": "Alpha-1-antitrypsin",
      "d": "Human interferon"
    },
    "correctAnswer": "a",
    "explanation": "Transgenic cow Rosie produced milk containing 2.4 grams per litre of human alpha-lactalbumin, making it nutritionally superior to traditional cow milk for infants.",
    "expDiagram": None
  },
  {
    "id": 33,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Biotechnology and Its Applications > Medical Applications",
    "question": "In 1990, the first clinical gene therapy was administered to a 4-year-old girl suffering from Severe Combined Immunodeficiency (SCID) caused by deficiency of:",
    "diagram": None,
    "options": {
      "a": "Tyrosine kinase",
      "b": "Adenosine deaminase (ADA)",
      "c": "Phenylalanine hydroxylase",
      "d": "DNA ligase"
    },
    "correctAnswer": "b",
    "explanation": "The landmark 1990 clinical gene therapy repaired ADA deficiency in a 4-year-old by infusing functional ADA cDNA using a retroviral vector into patient T-lymphocytes.",
    "expDiagram": None
  },
  {
    "id": 34,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Biotechnology and Its Applications > RNA Interference",
    "question": "RNA interference (RNAi) operates as a cellular defence mechanism in all eukaryotic organisms through:",
    "diagram": None,
    "options": {
      "a": "Silencing of specific mRNA due to complementary double-stranded RNA (dsRNA)",
      "b": "DNA methylation of promoter regions",
      "c": "Inhibition of aminoacyl-tRNA synthetases",
      "d": "Degradation of nuclear chromatin"
    },
    "correctAnswer": "a",
    "explanation": "RNAi silences target mRNA expression using a complementary double-stranded RNA molecule that triggers sequence-specific cleavage via RISC complex.",
    "expDiagram": None
  },
  {
    "id": 35,
    "subject": "Zoology",
    "section": "Zoology Section A",
    "topic": "Animal Kingdom > Cyclostomata",
    "question": "Which of the following living vertebrates lacks true jaws, possess a cartilaginous cranium and vertebral column, and migrates to fresh water for spawning?",
    "diagram": None,
    "options": {
      "a": "Petromyzon (Lamprey)",
      "b": "Scoliodon (Dogfish)",
      "c": "Exocoetus (Flying fish)",
      "d": "Labeo (Rohu)"
    },
    "correctAnswer": "a",
    "explanation": "Petromyzon (jawless cyclostome) is marine but migrates for spawning (anadromous migration) to fresh water, dying shortly afterwards.",
    "expDiagram": None
  },
  {
    "id": 36,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Chemical Coordination and Integration > Adrenal Gland",
    "question": "Given below are two statements:\nStatement I: Catecholamines (adrenaline and noradrenaline) are emergency hormones secreted by the adrenal cortex.\nStatement II: Catecholamines increase heartbeat, strength of heart contraction, and rate of respiration.\nIn light of above statements, select the correct answer:",
    "diagram": None,
    "options": {
      "a": "Statement I is true but Statement II is false",
      "b": "Statement I is false but Statement II is true",
      "c": "Both Statement I and Statement II are true",
      "d": "Both Statement I and Statement II are false"
    },
    "correctAnswer": "b",
    "explanation": "Statement I is false because catecholamines are secreted by the adrenal medulla (not cortex). Statement II is true as they mediate fight-or-flight cardiovascular and respiratory increases.",
    "expDiagram": None
  },
  {
    "id": 37,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Human Reproduction > Embryonic Development",
    "question": "The extra-embryonic membrane directly responsible for forming the fluid-filled shock-absorbing cushion around the developing mammalian embryo is the:",
    "diagram": None,
    "options": {
      "a": "Chorion",
      "b": "Amnion",
      "c": "Yolk sac",
      "d": "Allantois"
    },
    "correctAnswer": "b",
    "explanation": "The amnion envelops the amniotic cavity containing amniotic fluid, which cushions the foetus against mechanical shock and desiccation.",
    "expDiagram": None
  },
  {
    "id": 38,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Evolution > Human Evolution",
    "question": "Arrange the following ancestors of Homo sapiens in chronological evolutionary sequence from earliest to most recent:\n(A) Homo erectus\n(B) Australopithecus\n(C) Neanderthal man\n(D) Homo habilis\nChoose the correct sequence:",
    "diagram": None,
    "options": {
      "a": "B → D → A → C",
      "b": "D → B → A → C",
      "c": "B → A → D → C",
      "d": "A → B → C → D"
    },
    "correctAnswer": "a",
    "explanation": "Australopithecus (earliest) → Homo habilis (first tool maker, ~650-800 cc) → Homo erectus (~900 cc, ate meat) → Neanderthal man (1400 cc).",
    "expDiagram": None
  },
  {
    "id": 39,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Excretory Products and their Elimination > Renal Regulation",
    "question": "Angiotensin-II restores glomerular blood pressure and filtration rate by which of the following mechanisms?\n(A) Constriction of efferent arterioles\n(B) Stimulating adrenal cortex to secrete aldosterone\n(C) Causing vasodilation of peripheral arterioles\n(D) Increasing Na+ and water reabsorption in renal tubules\nChoose the correct combination:",
    "diagram": None,
    "options": {
      "a": "A, B and D only",
      "b": "B and C only",
      "c": "A, C and D only",
      "d": "B, C and D only"
    },
    "correctAnswer": "a",
    "explanation": "Angiotensin-II is a potent vasoconstrictor (primarily efferent arterioles), stimulates aldosterone release for Na+/water retention, thus elevating GFR and arterial pressure.",
    "expDiagram": None
  },
  {
    "id": 40,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Locomotion and Movement > Skeletal Elements",
    "question": "Match List-I with List-II:\nList-I (Bones)         List-II (Number in Human Body)\n(A) Cranial bones       (I) 14\n(B) Facial bones        (II) 8\n(C) True ribs           (III) 24\n(D) Total ribs          (IV) 7 pairs\nChoose the correct answer:",
    "diagram": None,
    "options": {
      "a": "A-(II), B-(I), C-(IV), D-(III)",
      "b": "A-(I), B-(II), C-(IV), D-(III)",
      "c": "A-(II), B-(I), C-(III), D-(IV)",
      "d": "A-(IV), B-(I), C-(II), D-(III)"
    },
    "correctAnswer": "a",
    "explanation": "Human cranium has 8 bones; facial skeleton has 14 bones; 7 pairs (1-7) are true ribs; total ribs are 24 (12 pairs).",
    "expDiagram": None
  },
  {
    "id": 41,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Animal Kingdom > Chordates (Mammalia)",
    "question": "Which of the following mammals is oviparous (egg-laying)?",
    "diagram": None,
    "options": {
      "a": "Macropus (Kangaroo)",
      "b": "Ornithorhynchus (Duck-billed Platypus)",
      "c": "Pteropus (Flying fox)",
      "d": "Balaenoptera (Blue whale)"
    },
    "correctAnswer": "b",
    "explanation": "Ornithorhynchus (Platypus) and Tachyglossus (Echidna) are monotremes, the only oviparous living mammals.",
    "expDiagram": None
  },
  {
    "id": 42,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Breathing and Exchange of Gases > Regulation of Respiration",
    "question": "The respiratory rhythm center in the medulla is primarily sensitive to which systemic chemical factors?",
    "diagram": None,
    "options": {
      "a": "O2 concentration and arterial blood pressure",
      "b": "CO2 concentration and H+ ion concentration",
      "c": "Dissolved Nitrogen content",
      "d": "Glucose concentration in CSF"
    },
    "correctAnswer": "b",
    "explanation": "The chemosensitive area adjacent to the medullary rhythm center responds primarily to increases in arterial pCO2 and H+ ion concentration, while arterial pO2 plays an insignificant direct role in central regulation.",
    "expDiagram": None
  },
  {
    "id": 43,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Body Fluids and Circulation > Cardiac Regulation",
    "question": "Parasympathetic neural signals transmitted via the vagus nerve influence cardiac activity by:",
    "diagram": None,
    "options": {
      "a": "Increasing the rate of heart beat and cardiac output",
      "b": "Decreasing heart rate, speed of conduction of action potential and cardiac output",
      "c": "Stimulating release of adrenaline from adrenal medulla",
      "d": "Constricting coronary arteries exclusively"
    },
    "correctAnswer": "b",
    "explanation": "Parasympathetic acetylcholine release at SA/AV nodes hyperpolarises cardiac pacemakers, slowing heart rate, reducing AV node conduction velocity and diminishing cardiac output.",
    "expDiagram": None
  },
  {
    "id": 44,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Human Reproduction > Parturition & Lactation",
    "question": "The neuroendocrine reflex (foetal ejection reflex) that initiates vigorous uterine contractions during parturition induces release of:",
    "diagram": None,
    "options": {
      "a": "Oxytocin from maternal posterior pituitary",
      "b": "Relaxin from placenta only",
      "c": "Human Chorionic Gonadotropin (hCG)",
      "d": "Prolactin from anterior pituitary"
    },
    "correctAnswer": "a",
    "explanation": "Fully developed foetus and placenta send signals inducing mild contractions, which trigger oxytocin release from maternal neurohypophysis, creating a positive feedback loop for childbirth.",
    "expDiagram": None
  },
  {
    "id": 45,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Reproductive Health > Medical Termination of Pregnancy (MTP)",
    "question": "Under the Medical Termination of Pregnancy (Amendment) Act, 2021 in India, abortion is deemed safest up to which gestation period?",
    "diagram": None,
    "options": {
      "a": "First trimester (up to 12 weeks)",
      "b": "Second trimester (up to 24 weeks) without opinion",
      "c": "Third trimester (28 weeks)",
      "d": "32 weeks"
    },
    "correctAnswer": "a",
    "explanation": "MTP is considered significantly safer during the first trimester (up to 12 weeks of pregnancy).",
    "expDiagram": None
  },
  {
    "id": 46,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Human Health and Disease > Drug and Alcohol Abuse",
    "question": "Morphine, a potent narcotic analgesic extracted from the latex of Papaver somniferum, exerts its physiological action by binding to:",
    "diagram": None,
    "options": {
      "a": "Cannabinoid receptors in the brain",
      "b": "Specific opioid receptors in the central nervous system and gastrointestinal tract",
      "c": "Dopamine transport receptors",
      "d": "Beta-adrenergic receptors on heart"
    },
    "correctAnswer": "b",
    "explanation": "Opioids like morphine and heroin bind to specific opioid receptors in our central nervous system (CNS) and gastrointestinal tract.",
    "expDiagram": None
  },
  {
    "id": 47,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Biotechnology and Its Applications > Molecular Diagnostics",
    "question": "ELISA (Enzyme-Linked Immunosorbent Assay) is primarily based on the principle of:",
    "diagram": None,
    "options": {
      "a": "Antigen-antibody interaction",
      "b": "Polymerase chain amplification of RNA",
      "c": "Differential centrifugation of enzymes",
      "d": "Denaturation and annealing of nucleic acids"
    },
    "correctAnswer": "a",
    "explanation": "ELISA diagnoses infections by detecting antibodies synthesized against a pathogen, or by detecting antigen proteins directly via enzyme-linked antigen-antibody binding.",
    "expDiagram": None
  },
  {
    "id": 48,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Animal Kingdom > Phylum Mollusca",
    "question": "The rasping tongue-like organ equipped with rows of chitinous teeth found in the mouth of most molluscs is called:",
    "diagram": None,
    "options": {
      "a": "Radula",
      "b": "Statocyst",
      "c": "Osphradium",
      "d": "Parapodium"
    },
    "correctAnswer": "a",
    "explanation": "Molluscs have a file-like rasping organ called radula in their mouth for feeding, scraping food particles from surfaces.",
    "expDiagram": None
  },
  {
    "id": 49,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Structural Organisation in Animals > Cockroach Morphology",
    "question": "In the male cockroach (Periplaneta americana), a pair of short, thread-like anal styles is born on which abdominal segment?",
    "diagram": None,
    "options": {
      "a": "9th sternum",
      "b": "10th tergum",
      "c": "7th sternum",
      "d": "8th tergum"
    },
    "correctAnswer": "a",
    "explanation": "Male cockroaches possess unjointed anal styles on the 9th abdominal sternum, which are absent in females (key sexual dimorphism).",
    "expDiagram": None
  },
  {
    "id": 50,
    "subject": "Zoology",
    "section": "Zoology Section B",
    "topic": "Chemical Coordination and Integration > Pituitary Hormones",
    "question": "Hypersecretion of growth hormone (GH) in adults after epiphyseal plate closure causes severe disfigurement, especially of the face, known as:",
    "diagram": None,
    "options": {
      "a": "Acromegaly",
      "b": "Gigantism",
      "c": "Cretinism",
      "d": "Pituitary dwarfism"
    },
    "correctAnswer": "a",
    "explanation": "Hypersecretion of GH in adults results in Acromegaly, causing bone thickening, coarse facial features and enlarged hands and feet, whereas hypersecretion during childhood causes gigantism.",
    "expDiagram": None
  }
]

with open('public/paper/zoology_50_questions.json', 'w', encoding='utf-8') as f:
    json.dump(zoology_questions, f, indent=2, ensure_ascii=False)

print("Saved 50 Zoology questions to public/paper/zoology_50_questions.json")
