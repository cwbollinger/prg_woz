// Constants for Speech and Motion
const SPEECH = {
    "say-hello": {category: 'basic', data: [
        "Hi There!",
        "Hello!",
        "Greetings",
    ]},
    "say-great": {category: 'basic', data: ["Great!"]},
    "say-ok": {category: 'basic', data: [
        "OK",
        "Sounds Good!"
    ]},
    "say-goodbye": {category: 'basic', data: [
        "Goodbye, Have a nice day!",
        "Nice talking with you.",
    ]},
    "say-joke": {category: 'question', data: [
        "A vegan said, 'People who sell meat are gross.' ... I said, 'People who sell vegetables are grocer.'",
        "What is green and smells like red paint? ... Green Paint.",
        "What is green and has wheels? ... Grass. I lied about the wheels.", 
        "I've been a gym member for 6 months without any progress... I should probably go there personally and see what the issue is.",
        "My girlfriend said, 'You act too much like a detective, I want to split up.' ... I replied, 'Good idea, we can cover more ground that way.'",
        "How many tickles does it take to make an octopus laugh? ... Ten tickles",
        "The depressing thing about tennis is that no matter how good I get, I'll never be as good as a wall.",
        "My carbon monoxide detector won't stop beeping... It's starting to give me a headache and dizziness and nausea.",
        "It's very risky when you butt dial somebody and they pick up, because then it's your ass on the line.",
        "I just read a book entitled, '50 Things to do Before You Die'... I was suprised that none of them were 'Shout for help!'",
        "Two cannibals are eating a clown. One says to the other, 'Do you think this tastes funny?'",
        "I told my doctor that I broke my arm in two places... He recommended that I stop going to those two places.",
        "I should have been sad when my flashlight batteries died... but I was delighted.",
        "The difference between a cat and a complex sentence is that a cat has claws at the end of its paws and a complex sentence has a pause at the end of its clause.",
        "What's the difference between a poorly dressed man on a unicycle and a well dressed man on a bicycle?... Attire!",
        "A man walks into a bar and sees his friend sitting beside a 12-inch pianist. He says to his friend, 'That's amazing. How did you get that?' The man pulls out a bottle and tells him to rub it and make a wish. He rubs the bottle, and a puff of smoke pops out and tells him that he can have one wish. So the man thinks and says, 'I wish I had a million bucks.'...The genie says, 'OK, go outside, and your wish will be granted.'...The man goes outside, but all he finds are ducks filling the sky and roads. He goes back in and tells his friend what happend, and his friend replies, 'I know. Did you really think I wanted a 12-inch pianist?'"
    ]},
    "say-exercise": {category: 'question', data: [
        "It's time for some exercise!",
        "Get ready to do some exercise",
        "Let's get up and moving!",
        "Exercise is an important part of overall health!"
    ]},
    "say-snack": {category: 'question', data: ["Would you like a healthy snack option?"]},
    "say-sure": {category: 'question', data: ["Are you sure?"]},
    "say-emotional-fact": {category: 'fact', data: [
        "Laughing 100 times is equivalent to 15 minutes of exercise on a stationary bicycle.",
        "Sleeping less than 7 hours each night reduces your life expectancy.",
        "Severe Depression can cause us to biologically age more by increasing the aging process in cells.",
        "On average, people who complain live longer. Releasing the tension increases immunity and boosts their health.",
        "Working past age 65 is linked to longer life, a study found.",
        "People who read books live an average of almost 2 years longer than those who do not read at all.",
        "Violent dreams may be an early sign of brain disorders down the line, including Parkinson's disease and dementia.",
        "More than 13 million working days are lost every year because of stress-related illnesses.",
        "Drinking green tea improves your working memory, which allows your brain to process multiple pieces of information at once.",
        "The smell of sage can reduce sadness and anxiety.",
        "Expressing gratitude boosts happiness and decreases depression.",
        "Taking photos interferes with your memory of an event.",
        "Spending time outdoors in nature increases happiness.",
        "Stress can make allergy symptoms worse.",
        "Laughing is good for the heart and can increase blood flow by 20 percent.",
        "Always look on the bright side: being an optimist can help you live longer.",
        "Learning a new language or playing a musical instrument gives your brain a boost.",
        "Feeling stressed? Read. Getting lost in a book can lower levels of cortisol, or other unhealthy stress hormones, by 67 percent.",
        "Maintaining good relationships with family and friends is good for your health, memory and longevity.",
        "Smelling rosemary may increase alertness and improve memory so catch a whiff before a test or important meeting.",
        "Swearing can make you feel better when you’re in pain.",
        "Writing things out by hand will help you remember them.",
        "Chewing gum makes you more alert, relieves stress and reduces anxiety levels.",
        "The blue light in phones can mess with your circadian rhythm.",
        "Feeling down? Plan a vacation. Not only will getting away make you feel better, but planning and anticipating the vacation will also give you a happiness boost.",
        "Breathing deeply in moments of stress, or anytime during the day, brings many benefits such as better circulation, decreased anxiety and reduced blood pressure."
    ]},
    "say-physical-fact": {category: 'fact', data: [
        "Working out is hard",
        "Lack of exercise causes nearly as many deaths as smoking.",
        "Sitting for more than three hours a day can cut two years off a person's life expectancy.",
        "Exercise, like walking, can reduce breast cancer risk by 25%.",
        "A half hour of physical activity 6 days a week is linked to 40% lower risk of early death.",
        "You can burn 20% more fat by exercising in the morning on an empty stomach.",
        "You can tweak your metabolic health by turning down the bedroom thermostat a few degrees.",
        "Household chores such as vacuuming or scrubbing the floor, or merely walking to work provide enough exercise to protect the heart and extend life.",
        "Sitting 11 hours or more each day leads to an earlier death.",
        "Exercising when you’re young will improve your brain function when you’re older.",
        "Exercise will give you more energy, even when you’re tired.",
        "Yoga can boost your cognitive function and lowers stress.",
        "The body has more than 650 muscles.",
        "To lose one pound of fat, you need to burn roughly 3,500 calories.",
        "Walking at a fast pace for three hours or more at least one time a week, you can reduce your risk of heart disease by up to 65%.",
        "Even at rest, muscle is three times more efficient at burning calories than fat.",
        "Regular activity can ease the severity and reduce the frequency of lower back pain.",
        "Running is good for you. People who run 12-18 miles a week have a stronger immune system and can increase their bone mineral density.",
        "Exercising regularly can increase your lifespan by keeping your DNA healthy and young.",
        "The average moderately active person walks approximately 7,500 steps a day, which is the lifetime equivalent of walking around the Earth five times.",
        "Stretching increases the blood flow to your muscles and helps avoid injuries.",
        "The eye muscles are the most active in the body, moving more than 100,000 times a day!",
        "Music improves workout performance",
        "Exercising improves brain performance",
        "Working out sharpens your memory",
        "Exercise can help you get sick less often",
        "Exercise can help reduce stress",
        "Physical activity reduces the risk of disease",
        "To maintain a healthy body, you should work out 150 minutes a week",
        "Exercise improves mood.",
        "Exercise promotes healthier sleep habits"
    ]},
    "say-nutrition-fact": {category: 'fact', data: [
        "People who regularly eat dinner or breakfast in restaurants double their risk of obesity.",
        "Over 30% of cancer could be prevented by avoiding tobacco and alcohol, having a healthy diet and physical activity.",
        "1 Can of Soda a day increases your chances of getting type 2 diabetes by 22%.",
        "McDonalds' Caesar salad is more fattening than their hamburger.",
        "A Father's Diet Before Conception Plays a Crucial Role in a Child's Health.",
        "Chicken contains 266% more fat than it did 40 years ago.",
        "Constipation-related health-care costs total US$6.9 billion per year in the U.S.",
        "Americans consume 12.5 teaspoons more sugar each day than the American Heart Association recommends.",
        "8.5% of adults worldwide currently have diabetes. That's almost twice as much as it was in 1980.",
        "Eating too much meat can accelerate your body's biological age.",
        "Worldwide, people consume 500 extra calories a day from sugar, which is roughly the amount of calories needed to gain a pound a week.",
        "There Is No Perfect Diet for Everyone",
        "Adults who eat a little chocolate five times a week are thinner than those who eat it less frequently.",
        "Eating foods high in lycopene—including tomatoes and tomato paste—can make you less susceptible to sunburn.",
        "On any given day, your weight will fluctuate by 2 to 5 pounds—of water.",
        "Eating eggs can improve your reflexes; they contain an amino acid that helps us make quick, knee-jerk reactions.",
        "Bananas relieve belly bloating.",
        "Eating oatmeal boosts seratonin, which calms your brain and improves your mood.",
        "Drinking coffee can reduce the risk of depression, especially in women.",
        "Almonds, avocados and arugula (the three ‘A’s) can boost your sex drive and improve fertility.",
        "Tea can lower risks of heart attack, certain cancers, type 2 Diabetes and Parkinson’s disease. Just make sure your tea isn’t too sweet!",
        "Although it only takes you a few minutes to eat a meal, it takes your body hours to completely digest the food.",
        "Women below the age of 50 need twice the amount of iron per day as men of the same age.",
        "An apple a day does keep the doctor away. Apples can reduce levels of bad cholesterol to keep your heart healthy.",
        "The amino acid found in eggs can help improve your reflexes.",
        "Extra virgin olive oil is the healthiest fat on the planet.",
        "Drinking at least five glasses of water a day can reduce your chances of suffering from a heart attack by 40%.",
        "Dehydration can have a negative impact on your mood and energy levels. Drink enough water to ensure you’re always at your best.",
        "Consuming water helps the body maintain its natural pH balance.",
        "Repeatedly using plastic water bottles can release chemicals into your water. Why not try a reusable bottle instead?",
        "The spinal disc core is comprised of a large volume of water therefore dehydration could lead to back pain.",
        "Kidneys filter your blood up to 300 times a day and need water to function optimally.",
        "Hydration is key for a good complexion. Drinking enough water also makes you less prone to wrinkles.",
        "A lack of water can cause a range of problems, such as constipation, asthma, allergy and migraines.",
        "Your muscles and joints require water in order to stay energized, lubricated and healthy."
    ]},
    "say-pushups": {category: 'guide', data: ["Now it's time for some pushups! Tell me when you're ready."]},
    "say-jumping-jacks": {category: 'guide', data: ["Jumping jacks are fun, let's do some! Or you can, I don't have the limbs required.   Tell me when you're ready."]},
    "say-squats": {category: 'guide', data: ["Let's do some chair squats. Just stand and sit ten times. Tell me when you're ready."]},
    "say-walk": {category: 'guide', data: ["Take a quick walk to the end of the building and back."]},
};
export default SPEECH;