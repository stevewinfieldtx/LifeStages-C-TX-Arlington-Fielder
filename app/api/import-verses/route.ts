import { createClient } from '@supabase/supabase-js'
import Papa from 'papaparse'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Hardcoded verses as fallback (from Bible.com CSV you provided)
const FALLBACK_VERSES = [
  { date: "2026-01-12", verse_reference: "Mark 8:35", verse_text: "For whoever wants to save their life will lose it, but whoever loses their life for me and for the gospel will save it.", bible_url: "https://bible.com/bible/111/MRK.8.35" },
  { date: "2026-01-13", verse_reference: "Luke 12:40", verse_text: "You also must be ready, because the Son of Man will come at an hour when you do not expect him.", bible_url: "https://bible.com/bible/111/LUK.12.40" },
  { date: "2026-01-14", verse_reference: "Proverbs 22:4", verse_text: "Humility is the fear of the Lord; its wages are riches and honor and life.", bible_url: "https://bible.com/bible/111/PRO.22.4" },
  { date: "2026-01-15", verse_reference: "Matthew 6:21", verse_text: "For where your treasure is, there your heart will be also.", bible_url: "https://bible.com/bible/111/MAT.6.21" },
  { date: "2026-01-16", verse_reference: "Zephaniah 3:17", verse_text: "The LORD your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.", bible_url: "https://bible.com/bible/111/ZEP.3.17" },
  { date: "2026-01-17", verse_reference: "Hebrews 4:10", verse_text: "for anyone who enters God's rest also rests from their works, just as God did from his.", bible_url: "https://bible.com/bible/111/HEB.4.10" },
  { date: "2026-01-18", verse_reference: "1 Corinthians 1:10", verse_text: "I appeal to you, brothers and sisters, in the name of our Lord Jesus Christ, that all of you agree with one another in what you say and that there be no divisions among you, but that you be perfectly united in mind and thought.", bible_url: "https://bible.com/bible/111/1CO.1.10" },
  { date: "2026-01-19", verse_reference: "Psalm 133:1", verse_text: "How good and pleasant it is when God's people live together in unity!", bible_url: "https://bible.com/bible/111/PSA.133.1" },
  { date: "2026-01-20", verse_reference: "1 Thessalonians 5:15", verse_text: "Make sure that nobody pays back wrong for wrong, but always strive to do what is good for each other and for everyone else.", bible_url: "https://bible.com/bible/111/1TH.5.15" },
  { date: "2026-01-21", verse_reference: "Proverbs 18:10", verse_text: "The name of the Lord is a fortified tower; the righteous run to it and are safe.", bible_url: "https://bible.com/bible/111/PRO.18.10" },
  { date: "2026-01-22", verse_reference: "Philemon 1:6", verse_text: "I pray that your partnership with us in the faith may be effective in deepening your understanding of every good thing we share for the sake of Christ.", bible_url: "https://www.bible.com/bible/111/PHM.1.6.NIV" },
  { date: "2026-01-23", verse_reference: "Romans 8:1", verse_text: "Therefore, there is now no condemnation for those who are in Christ Jesus,", bible_url: "https://bible.com/bible/111/ROM.8.1" },
  { date: "2026-01-24", verse_reference: "Lamentations 3:25", verse_text: "The Lord is good to those whose hope is in him, to the one who seeks him.", bible_url: "https://bible.com/bible/111/LAM.3.25" },
  { date: "2026-01-25", verse_reference: "1 John 4:15", verse_text: "If anyone acknowledges that Jesus is the Son of God, God lives in them and they in God.", bible_url: "https://bible.com/bible/111/1JN.4.15" },
  { date: "2026-01-26", verse_reference: "Psalm 8:3-4", verse_text: "When I consider your heavens, the work of your fingers, the moon and the stars, which you have set in place, what is mankind that you are mindful of them, human beings that you care for them?", bible_url: "https://bible.com/bible/111/PSA.8.3-4" },
  { date: "2026-01-27", verse_reference: "Psalm 143:10", verse_text: "Teach me to do your will, for you are my God; may your good Spirit lead me on level ground.", bible_url: "https://bible.com/bible/111/PSA.143.10" },
  { date: "2026-01-28", verse_reference: "Philippians 4:6", verse_text: "Don't worry about anything; instead, pray about everything. Tell God what you need, and thank him for all he has done.", bible_url: "https://bible.com/bible/111/PHP.4.6" },
  { date: "2026-01-29", verse_reference: "1 Samuel 2:2", verse_text: "There is no one holy like the Lord; there is no one besides you; there is no Rock like our God.", bible_url: "https://bible.com/bible/111/1SA.2.2" },
  { date: "2026-01-30", verse_reference: "James 1:22", verse_text: "Do not merely listen to the word, and so deceive yourselves. Do what it says.", bible_url: "https://bible.com/bible/111/JAS.1.22" },
  { date: "2026-01-31", verse_reference: "Hebrews 10:24", verse_text: "And let us consider how we may spur one another on toward love and good deeds", bible_url: "https://bible.com/bible/111/HEB.10.24" },
  { date: "2026-02-01", verse_reference: "Luke 1:46-47", verse_text: "And Mary said: \"My soul glorifies the Lord and my spirit rejoices in God my Savior.\"", bible_url: "https://bible.com/bible/111/LUK.1.46-47" },
  { date: "2026-02-02", verse_reference: "2 Corinthians 12:10", verse_text: "That is why, for Christ's sake, I delight in weaknesses, in insults, in hardships, in persecutions, in difficulties. For when I am weak, then I am strong.", bible_url: "https://bible.com/bible/111/2CO.12.10" },
  { date: "2026-02-03", verse_reference: "Psalm 23:4", verse_text: "Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.", bible_url: "https://bible.com/bible/111/PSA.23.4" },
  { date: "2026-02-04", verse_reference: "Matthew 7:12", verse_text: "So in everything, do to others what you would have them do to you, for this sums up the Law and the Prophets.", bible_url: "https://bible.com/bible/111/MAT.7.12" },
  { date: "2026-02-05", verse_reference: "Proverbs 12:25", verse_text: "Anxiety weighs down the heart, but a kind word cheers it up.", bible_url: "https://bible.com/bible/111/PRO.12.25" },
  { date: "2026-02-06", verse_reference: "Hebrews 12:1", verse_text: "Therefore, since we are surrounded by such a great cloud of witnesses, let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us,", bible_url: "https://bible.com/bible/111/HEB.12.1" },
  { date: "2026-02-07", verse_reference: "1 Timothy 4:8", verse_text: "For physical training is of some value, but godliness has value for all things, holding promise for both the present life and the life to come.", bible_url: "https://bible.com/bible/111/1TI.4.8" },
  { date: "2026-02-08", verse_reference: "James 1:2-3", verse_text: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.", bible_url: "https://bible.com/bible/111/JAS.1.2-3" },
  { date: "2026-02-09", verse_reference: "Psalm 94:19", verse_text: "When anxiety was great within me, your consolation brought me joy.", bible_url: "https://bible.com/bible/111/PSA.94.19" },
  { date: "2026-02-10", verse_reference: "Romans 5:3-4", verse_text: "We also glory in our sufferings, because we know that suffering produces perseverance; perseverance, character; and character, hope.", bible_url: "https://bible.com/bible/111/ROM.5.3+ROM.5.4" },
  { date: "2026-02-11", verse_reference: "2 Corinthians 9:8", verse_text: "And God is able to bless you abundantly, so that in all things at all times, having all that you need, you will abound in every good work.", bible_url: "https://bible.com/bible/111/2CO.9.8" },
  { date: "2026-02-12", verse_reference: "Philippians 4:13", verse_text: "I can do all this through him who gives me strength.", bible_url: "https://bible.com/bible/111/PHP.4.13" },
  { date: "2026-02-13", verse_reference: "1 Peter 4:16", verse_text: "If you suffer as a Christian, do not be ashamed, but praise God that you bear that name.", bible_url: "https://bible.com/bible/111/1PE.4.16" },
  { date: "2026-02-14", verse_reference: "Romans 12:10", verse_text: "Be devoted to one another in love. Honor one another above yourselves.", bible_url: "https://bible.com/bible/111/ROM.12.10" },
  { date: "2026-02-15", verse_reference: "Proverbs 23:24", verse_text: "The father of a righteous child has great joy; a man who fathers a wise son rejoices in him.", bible_url: "https://bible.com/bible/111/PRO.23.24" },
  { date: "2026-02-16", verse_reference: "2 John 1:6", verse_text: "And this is love: that we walk in obedience to his commands. As you have heard from the beginning, his command is that you walk in love.", bible_url: "https://bible.com/bible/111/2JN.1.6" },
  { date: "2026-02-17", verse_reference: "Habakkuk 2:14", verse_text: "For the earth will be filled with the knowledge of the glory of the Lord as the waters cover the sea.", bible_url: "https://bible.com/bible/111/HAB.2.14" },
  { date: "2026-02-18", verse_reference: "2 Timothy 4:7", verse_text: "I have fought the good fight, I have finished the race, I have kept the faith.", bible_url: "https://bible.com/bible/111/2TI.4.7" },
  { date: "2026-02-19", verse_reference: "Hebrews 12:11", verse_text: "No discipline seems pleasant at the time, but painful. Later on, however, it produces a harvest of righteousness and peace for those who have been trained by it.", bible_url: "https://bible.com/bible/111/HEB.12.11" },
  { date: "2026-02-20", verse_reference: "Acts 20:24", verse_text: "However, I consider my life worth nothing to me; my only aim is to finish the race and complete the task the Lord Jesus has given me—the task of testifying to the good news of God's grace.", bible_url: "https://bible.com/bible/111/ACT.20.24" },
  { date: "2026-02-21", verse_reference: "John 14:6", verse_text: "Jesus answered, I am the way and the truth and the life. No one comes to the Father except through me.", bible_url: "https://bible.com/bible/111/JHN.14.6" },
  { date: "2026-02-22", verse_reference: "1 Chronicles 16:11", verse_text: "Look to the Lord and his strength; seek his face always.", bible_url: "https://bible.com/bible/111/1CH.16.11" },
  { date: "2026-02-23", verse_reference: "Ecclesiastes 12:13", verse_text: "Now all has been heard; here is the conclusion of the matter: Fear God and keep his commandments, for this is the duty of all mankind.", bible_url: "https://bible.com/bible/111/ECC.12.13" },
  { date: "2026-02-24", verse_reference: "Matthew 13:44", verse_text: "The kingdom of heaven is like treasure hidden in a field. When a man found it, he hid it again, and then in his joy went and sold all he had and bought that field.", bible_url: "https://www.bible.com/bible/111/MAT.13.44" },
  { date: "2026-02-25", verse_reference: "Isaiah 25:1", verse_text: "Lord, you are my God; I will exalt you and praise your name, for in perfect faithfulness you have done wonderful things, things planned long ago.", bible_url: "https://bible.com/bible/111/ISA.25.1" },
  { date: "2026-02-26", verse_reference: "Psalm 37:4", verse_text: "Take delight in the Lord, and he will give you the desires of your heart.", bible_url: "https://bible.com/bible/111/PSA.37.4" },
  { date: "2026-02-27", verse_reference: "Ephesians 5:1", verse_text: "Follow God's example, therefore, as dearly loved children", bible_url: "https://bible.com/bible/111/EPH.5.1" },
  { date: "2026-02-28", verse_reference: "Proverbs 18:24", verse_text: "One who has unreliable friends soon comes to ruin, but there is a friend who sticks closer than a brother.", bible_url: "https://bible.com/bible/111/PRO.18.24" },
  { date: "2026-03-01", verse_reference: "2 Peter 3:9", verse_text: "The Lord is not slow in keeping his promise, as some understand slowness. Instead he is patient with you, not wanting anyone to perish, but everyone to come to repentance.", bible_url: "https://bible.com/bible/111/2PE.3.9" },
  { date: "2026-03-02", verse_reference: "Romans 12:21", verse_text: "Do not be overcome by evil, but overcome evil with good.", bible_url: "https://bible.com/bible/111/ROM.12.21" },
  { date: "2026-03-03", verse_reference: "Joshua 1:9", verse_text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", bible_url: "https://bible.com/bible/111/JOS.1.9" },
  { date: "2026-03-04", verse_reference: "Psalm 143:8", verse_text: "Let the morning bring me word of your unfailing love, for I have put my trust in you. Show me the way I should go, for to you I entrust my life.", bible_url: "https://bible.com/bible/111/PSA.143.8" },
  { date: "2026-03-05", verse_reference: "Matthew 6:3", verse_text: "But when you give to the needy, do not let your left hand know what your right hand is doing,", bible_url: "https://bible.com/bible/111/MAT.6.3" },
  { date: "2026-03-06", verse_reference: "2 Corinthians 4:18", verse_text: "So we fix our eyes not on what is seen, but on what is unseen, since what is seen is temporary, but what is unseen is eternal.", bible_url: "https://bible.com/bible/111/2CO.4.18" },
  { date: "2026-03-07", verse_reference: "2 Thessalonians 3:3", verse_text: "But the Lord is faithful, and he will strengthen you and protect you from the evil one.", bible_url: "https://bible.com/bible/111/2TH.3.3" },
  { date: "2026-03-08", verse_reference: "Proverbs 31:25-26", verse_text: "She is clothed with strength and dignity; she can laugh at the days to come. She speaks with wisdom, and faithful instruction is on her tongue", bible_url: "https://bible.com/bible/111/PRO.31.25-26" },
  { date: "2026-03-09", verse_reference: "1 Peter 5:7", verse_text: "Cast all your anxiety on him because he cares for you.", bible_url: "https://bible.com/bible/111/1PE.5.7" },
  { date: "2026-03-10", verse_reference: "Proverbs 31:30", verse_text: "Charm is deceptive, and beauty is fleeting; but a woman who fears the Lord is to be praised.", bible_url: "https://bible.com/bible/111/PRO.31.30" },
  { date: "2026-03-11", verse_reference: "John 10:11", verse_text: "I am the good shepherd. The good shepherd lays down his life for the sheep.", bible_url: "https://bible.com/bible/111/JHN.10.11" },
  { date: "2026-03-12", verse_reference: "Romans 5:1", verse_text: "Therefore, since we have been justified through faith, we have peace with God through our Lord Jesus Christ.", bible_url: "https://bible.com/bible/111/ROM.5.1" },
  { date: "2026-03-13", verse_reference: "Genesis 1:1", verse_text: "In the beginning God created the heavens and the earth.", bible_url: "https://bible.com/bible/111/GEN.1.1" },
  { date: "2026-03-14", verse_reference: "Esther 4:14", verse_text: "If you remain silent at this time, relief and deliverance will arise from another place, but you and your father's family will perish. And who knows but that you have come to your royal position for such a time as this?", bible_url: "https://bible.com/bible/111/EST.4.14" },
  { date: "2026-03-15", verse_reference: "James 5:13", verse_text: "Is anyone among you suffering? Let him pray. Is anyone cheerful? Let him sing praise.", bible_url: "https://bible.com/bible/111/JAS.5.13" },
  { date: "2026-03-16", verse_reference: "Psalm 105:1", verse_text: "Give praise to the Lord, proclaim his name; make known among the nations what he has done.", bible_url: "https://bible.com/bible/111/PSA.105.1" },
  { date: "2026-03-17", verse_reference: "Proverbs 3:5-6", verse_text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", bible_url: "https://bible.com/bible/111/PRO.3.5-6" },
  { date: "2026-03-18", verse_reference: "1 John 4:4", verse_text: "You, dear children, are from God and have overcome them, because the one who is in you is greater than the one who is in the world.", bible_url: "https://bible.com/bible/111/1JN.4.4" },
  { date: "2026-03-19", verse_reference: "Psalm 23:6", verse_text: "Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the Lord forever.", bible_url: "https://bible.com/bible/111/PSA.23.6" },
  { date: "2026-03-20", verse_reference: "Hebrews 4:9", verse_text: "There remains, then, a Sabbath-rest for the people of God;", bible_url: "https://bible.com/bible/111/HEB.4.9" },
  { date: "2026-03-21", verse_reference: "Psalm 56:3", verse_text: "When I am afraid, I put my trust in you.", bible_url: "https://bible.com/bible/111/PSA.56.3" },
  { date: "2026-03-22", verse_reference: "2 Corinthians 7:10", verse_text: "Godly sorrow brings repentance that leads to salvation and leaves no regret, but worldly sorrow brings death.", bible_url: "https://bible.com/bible/111/2CO.7.10" },
  { date: "2026-03-23", verse_reference: "Psalm 42:1", verse_text: "As the deer pants for streams of water, so my soul pants for you, my God.", bible_url: "https://bible.com/bible/111/PSA.42.1" },
  { date: "2026-03-24", verse_reference: "Matthew 7:8", verse_text: "For everyone who asks receives; the one who seeks finds; and to the one who knocks, the door will be opened.", bible_url: "https://bible.com/bible/111/MAT.7.8" },
  { date: "2026-03-25", verse_reference: "John 7:38", verse_text: "Whoever believes in me, as Scripture has said, rivers of living water will flow from within them", bible_url: "https://bible.com/bible/111/JHN.7.38" },
  { date: "2026-03-26", verse_reference: "Jeremiah 29:13", verse_text: "You will seek me and find me when you seek me with all your heart.", bible_url: "https://bible.com/bible/111/JER.29.13" },
  { date: "2026-03-27", verse_reference: "Romans 15:5", verse_text: "May the God who gives endurance and encouragement give you the same attitude of mind toward each other that Christ Jesus had,", bible_url: "https://bible.com/bible/111/ROM.15.5" },
  { date: "2026-03-28", verse_reference: "Psalm 3:3", verse_text: "But you, Lord, are a shield around me, my glory, the One who lifts my head high.", bible_url: "https://bible.com/bible/111/PSA.3.3" },
  { date: "2026-03-29", verse_reference: "Luke 19:38", verse_text: "Blessed is the king who comes in the name of the Lord! Peace in heaven and glory in the highest!", bible_url: "https://bible.com/bible/111/LUK.19.38" },
  { date: "2026-03-30", verse_reference: "John 1:29", verse_text: "Look, the Lamb of God, who takes away the sin of the world!", bible_url: "https://bible.com/bible/111/JHN.1.29" },
  { date: "2026-03-31", verse_reference: "Matthew 20:28", verse_text: "The Son of Man did not come to be served, but to serve, and to give his life as a ransom for many.", bible_url: "https://bible.com/bible/111/MAT.20.28" },
  { date: "2026-04-01", verse_reference: "Hebrews 12:2", verse_text: "fixing our eyes on Jesus, the pioneer and perfecter of faith. For the joy set before him he endured the cross, scorning its shame, and sat down at the right hand of the throne of God.", bible_url: "https://bible.com/bible/111/HEB.12.2" },
  { date: "2026-04-02", verse_reference: "John 16:33", verse_text: "I have said these things to you, that in me you may have peace. In the world you will have tribulation. But take heart; I have overcome the world.", bible_url: "https://bible.com/bible/111/JHN.16.33" },
  { date: "2026-04-03", verse_reference: "Isaiah 53:5", verse_text: "He was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.", bible_url: "https://bible.com/bible/111/ISA.53.5" },
  { date: "2026-04-04", verse_reference: "1 John 3:16", verse_text: "This is how we know what love is: Jesus Christ laid down his life for us. And we ought to lay down our lives for our brothers and sisters.", bible_url: "https://bible.com/bible/111/1JN.3.16" },
  { date: "2026-04-05", verse_reference: "Matthew 28:6", verse_text: "He is not here; he has risen, just as he said. Come and see the place where he lay.", bible_url: "https://bible.com/bible/111/MAT.28.6" },
  { date: "2026-04-06", verse_reference: "Matthew 28:19", verse_text: "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit", bible_url: "https://bible.com/bible/111/MAT.28.19" },
  { date: "2026-04-07", verse_reference: "John 5:24", verse_text: "I tell you the truth, whoever hears my word and believes him who sent me has eternal life", bible_url: "https://bible.com/bible/111/JHN.5.24" },
  { date: "2026-04-08", verse_reference: "Romans 10:17", verse_text: "Faith comes from hearing the message, and the message is heard through the word about Christ.", bible_url: "https://bible.com/bible/111/ROM.10.17" },
  { date: "2026-04-09", verse_reference: "Acts 4:12", verse_text: "Salvation is found in no one else, for there is no other name under heaven given to mankind by which we must be saved.", bible_url: "https://bible.com/bible/111/ACT.4.12" },
  { date: "2026-04-10", verse_reference: "Psalm 145:18", verse_text: "The Lord is near to all who call on him, to all who call on him in truth.", bible_url: "https://bible.com/bible/111/PSA.145.18" },
  { date: "2026-04-11", verse_reference: "1 Corinthians 3:16", verse_text: "Don't you know that you yourselves are God's temple and that God's Spirit dwells in your midst?", bible_url: "https://bible.com/bible/111/1CO.3.16" },
]

export async function POST(request: Request) {
  try {
    const { secret, source } = await request.json()
    
    // Validate secret (last 10 chars of service role key)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const expectedSecret = serviceRoleKey.slice(-10)
    
    if (secret !== expectedSecret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let verses: any[] = []

    // Try to fetch from Airtable if source is 'airtable'
    if (source === 'airtable') {
      try {
        const airtableUrl = 'https://airtable.com/app2JIRyt8lBPlm3Y/shrbYrsD5WZpXoeEC/tblmZ0hjSypzXEJPe/viwYesFu1NZaQl6mC/csv'
        const response = await fetch(airtableUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        
        if (response.ok) {
          const csvText = await response.text()
          const { data } = Papa.parse(csvText, { header: true })
          
          verses = data
            .filter((row: any) => row['Date'] && row['Verse of the Day'])
            .map((row: any) => ({
              date: row['Date'],
              verse_reference: row['Verse of the Day'],
              verse_text: row['Reference Text'] || '',
              bible_url: row['URL'] || '',
              church_id: null
            }))
          
          console.log(`[Import] Fetched ${verses.length} verses from Airtable`)
        } else {
          console.log('[Import] Airtable fetch failed, using fallback')
        }
      } catch (e) {
        console.error('[Import] Airtable error:', e)
      }
    }

    // Use fallback if Airtable didn't work or wasn't requested
    if (verses.length === 0) {
      verses = FALLBACK_VERSES.map(v => ({ ...v, church_id: null }))
      console.log(`[Import] Using ${verses.length} fallback verses`)
    }

    // Upsert into Supabase (update if exists, insert if not)
    const { data, error } = await supabase
      .from('verses')
      .upsert(verses, { 
        onConflict: 'date,church_id',
        ignoreDuplicates: false 
      })
      .select()

    if (error) {
      console.error('[Import] Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ 
      success: true, 
      message: `Imported ${verses.length} verses`,
      source: source === 'airtable' ? 'Airtable' : 'Fallback',
      sample: verses.slice(0, 3)
    })
  } catch (error) {
    console.error('[Import] Error:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}

// GET endpoint to check status
export async function GET() {
  try {
    const { count, error } = await supabase
      .from('verses')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    return Response.json({
      verses_in_database: count || 0,
      fallback_verses_available: FALLBACK_VERSES.length,
      date_range: {
        start: FALLBACK_VERSES[0]?.date,
        end: FALLBACK_VERSES[FALLBACK_VERSES.length - 1]?.date
      }
    })
  } catch (error) {
    return Response.json({ 
      error: 'Database not connected or table not created',
      details: String(error)
    }, { status: 500 })
  }
}
