import extractor from "../../../src/utils/extract/extract";

let note = `This is a #test of +context @person #语 @语 +语 @brandon Nomies 
  
#extractor(4)! #home(0)? #coffee(3), #sleep(01:00:00) #taco[b32] and #cheese #cheese #cheese`;

describe("utils/extractor", function () {
  it("should parse this persons note", () => {
    let theNote = `This is a special #checkin because I did a 24 hr fast for the first time and I was alright. I did drink some coffees though. You can see that in the logs. #mood(9)



    #meal`;
    let extracted = extractor.parse(theNote);
    console.log(extracted);
    expect(extracted[2].value).to.equal(1);
  });

  it("Should be able extract Element from string", () => {
    expect(extractor.toElement(" #mood").type).to.equal("tracker");
    expect(extractor.toElement("#mood(43)").value).to.equal(43);
    expect(extractor.toElement("#语(43.324321234321233oz)").value).to.equal(43.324321234321233);
    expect(extractor.toElement("#语(43)").id).to.equal("语");
    expect(extractor.toElement("@mood").type).to.equal("person");
    expect(extractor.toElement("+mood").type).to.equal("context");
    expect(extractor.toElement("+mood(32)").type).to.equal("context");
    expect(
      extractor.toElement(`

+mood(32)
#water`).value
    ).to.equal(32);
    expect(extractor.toElement("+mood(32): #dd").id).to.equal("mood");
    expect(extractor.toElement("+😁").id).to.equal("😁");
    expect(extractor.toElement("#timer(02:00:00)").value).to.equal(7200);
    expect(extractor.toElement("#timer(02:00)").value).to.equal(7200);
    expect(extractor.toElement("#timer()").value).to.equal(1);
  });

  const tester = (options = {}) => {
    let defaultFunc = () => {};
    options.count = options.count || 400;
    options.name = options.name || "Unknown";
    options.function = options.function || defaultFunc;
    console.log(`🎬 Starting ${options.name}`);
    let start = new Date().getTime();
    for (var i = 0; i < options.count; i++) {
      options.function();
    }
    console.log(`🎬 Finished: ${name} in ${new Date().getTime() - start}ms`);
    return new Date().getTime() - start;
  };

  it("should handle 's ok", () => {
    let note = "this is @brandon's test #momo's too? #momo(34)'s";
    let parsed = extractor.parse(note);
    expect(parsed[0].id).to.equal("brandon");
    expect(parsed[1].id).to.equal("momo");
    expect(parsed[2].id).to.equal("momo");
    expect(parsed[2].remainder).to.equal("'s");
  });

  it("should parse 60,000 complicated notes in less than 3 seconds", () => {
    let notes = [];
    let parsed = tester({
      name: "baseline",
      count: 60000,
      function() {
        notes.push(extractor.parse(note));
      },
    });
    expect(parsed).to.be.lessThan(3000);
  });

  it("Should handle #test_time: #hj #bj", () => {
    let note = " #test_time: #hj #bj";
    let parsed = extractor.parse(note);
    expect(parsed[0].id).to.equal("test_time");
  });

  it("Should handle a generic object in the toElement", () => {
    let element = extractor.toElement("sample do");
    expect(element.id).to.equal("sample_do");
    expect(element.type).to.equal("generic");
    expect(element.raw).to.equal("sample do");
  });

  it("should handle being passed a null", () => {
    expect(extractor.parse().length).to.equal(0);
  });

  it("should handle new lines with the first tag", () => {
    let note = `do this man. 
 
#mood(4) #energy(4) #motivation(2) #stress(8) #sd(3)`;
    let parsed = extractor.parse(note);
    expect(parsed[0].id).to.equal("mood");
  });

  it("Should do fine with something like +covid19.", () => {
    let note = `This is a note  +covid19.\n\t\r +covid14 
    `;
    expect(extractor.parse(note)[1].type).to.equal("context");
    expect(extractor.parse(note)[1].id).to.equal("covid14");
    expect(extractor.parse(note)[0].type).to.equal("context");
    expect(extractor.parse(note)[0].id).to.equal("covid19");
  });

  it("should extract all the things", () => {
    let note =
      "This is a #test of +context @person #语 @语 +语 @brandon Nomies #extractor(4)! #home(0)? #coffee(3), #sleep(01:00:00) and #cheese #cheese #cheese";

    let results = extractor.parse(note);
    expect(results.length).to.equal(14);
    expect(results[0].type).to.equal("tracker");
    expect(results[1].type).to.equal("context");
    expect(results[2].type).to.equal("person");
  });

  it("should allow inclusion of generic terms", () => {
    let note = "This is a #note, can you dig it?";
    let parsed = extractor.parse(note, { includeGeneric: true });
    expect(parsed[3].remainder).to.equal(",");
    expect(parsed.length).to.equal(8);
    expect(parsed[7].raw).to.equal("it?");
  });

  it("should extract tracker detail", () => {
    let results = extractor.trackers(note);
    expect(results[0].id).to.equal("test");
    expect(results[1].id).to.equal("语");
    expect(results[2].id).to.equal("extractor");
    expect(results[2].value).to.equal(4);
    expect(results[3].id).to.equal("home");
    expect(results[3].value).to.equal(0);
    expect(results[4].id).to.equal("coffee");
    expect(results[4].value).to.equal(3);
    expect(results[5].id).to.equal("sleep");
    expect(results[5].value).to.equal(3600);
  });

  it("extract-people", () => {
    let note = "What a test! @brandon_corbin @b41d34 #extractor(4) +context1 +winner";
    let results = extractor.context(note);
    expect(results[0].id).to.equal("context1");
    expect(results[1].id).to.equal("winner");
    let note2 = "No Context";
    let results2 = extractor.context(note2);
    expect(results2.length).to.equal(0);
    // expect(math.sum([1, 2])).to.equal(3);
  });
  it("extract-people", () => {
    let note = "What a test! @brandon_corbin @b41d34 #extractor(4) +context1 +winner";
    let results = extractor.people(note);

    expect(results[0].id).to.equal("brandon_corbin");
    expect(results[1].id).to.equal("b41d34");

    let note2 = "No Context";
    let results2 = extractor.people(note2);
    expect(results2.length).to.equal(0);
    // expect(math.sum([1, 2])).to.equal(3);
  });
});
