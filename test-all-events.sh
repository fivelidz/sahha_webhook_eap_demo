#\!/bin/bash

echo "🚀 Simulating Complete Sahha Webhook Events"
echo "============================================"
echo

# Array of test profiles to create
PROFILES=("EMP-001" "EMP-002" "EMP-003" "EMP-004" "EMP-005")
DEPARTMENTS=("tech" "sales" "operations" "admin" "unassigned")
ARCHETYPES=("sedentary" "lightly_active" "moderately_active" "highly_active" "very_active")
SLEEP_PATTERNS=("poor_sleeper" "fair_sleeper" "good_sleeper" "excellent_sleeper")
MENTAL_STATES=("poor_mental_wellness" "fair_mental_wellness" "good_mental_wellness" "optimal_mental_wellness")

for i in ${\!PROFILES[@]}; do
    PROFILE_ID=${PROFILES[$i]}
    DEPT=${DEPARTMENTS[$i]}
    ARCHETYPE=${ARCHETYPES[$i]}
    SLEEP=${SLEEP_PATTERNS[$((i % 4))]}
    MENTAL=${MENTAL_STATES[$((i % 4))]}
    
    echo "📝 Creating profile: $PROFILE_ID (Department: $DEPT)"
    
    # Create wellbeing score
    WELLBEING_SCORE=$((50 + RANDOM % 50))
    curl -X POST http://localhost:3000/api/sahha/webhook \
      -H "Content-Type: application/json" \
      -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
      -H "X-External-Id: $PROFILE_ID" \
      -d "{
        \"type\": \"wellbeing\",
        \"score\": $WELLBEING_SCORE,
        \"state\": \"$([ $WELLBEING_SCORE -gt 70 ] && echo 'good' || echo 'moderate')\",
        \"department\": \"$DEPT\"
      }" -s > /dev/null
    
    # Create activity score
    ACTIVITY_SCORE=$((40 + RANDOM % 60))
    curl -X POST http://localhost:3000/api/sahha/webhook \
      -H "Content-Type: application/json" \
      -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
      -H "X-External-Id: $PROFILE_ID" \
      -d "{
        \"type\": \"activity\",
        \"score\": $ACTIVITY_SCORE,
        \"state\": \"$([ $ACTIVITY_SCORE -gt 60 ] && echo 'active' || echo 'inactive')\"
      }" -s > /dev/null
    
    # Create sleep score
    SLEEP_SCORE=$((45 + RANDOM % 55))
    curl -X POST http://localhost:3000/api/sahha/webhook \
      -H "Content-Type: application/json" \
      -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
      -H "X-External-Id: $PROFILE_ID" \
      -d "{
        \"type\": \"sleep\",
        \"score\": $SLEEP_SCORE,
        \"state\": \"$([ $SLEEP_SCORE -gt 65 ] && echo 'good' || echo 'poor')\"
      }" -s > /dev/null
    
    # Create mental wellbeing score
    MENTAL_SCORE=$((50 + RANDOM % 50))
    curl -X POST http://localhost:3000/api/sahha/webhook \
      -H "Content-Type: application/json" \
      -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
      -H "X-External-Id: $PROFILE_ID" \
      -d "{
        \"type\": \"mentalWellbeing\",
        \"score\": $MENTAL_SCORE,
        \"state\": \"$([ $MENTAL_SCORE -gt 70 ] && echo 'good' || echo 'moderate')\"
      }" -s > /dev/null
    
    # Create activity level archetype
    curl -X POST http://localhost:3000/api/sahha/webhook \
      -H "Content-Type: application/json" \
      -H "X-Event-Type: ArchetypeCreatedIntegrationEvent" \
      -H "X-External-Id: $PROFILE_ID" \
      -d "{
        \"name\": \"activity_level\",
        \"value\": \"$ARCHETYPE\",
        \"dataType\": \"ordinal\"
      }" -s > /dev/null
    
    # Create sleep pattern archetype
    curl -X POST http://localhost:3000/api/sahha/webhook \
      -H "Content-Type: application/json" \
      -H "X-Event-Type: ArchetypeCreatedIntegrationEvent" \
      -H "X-External-Id: $PROFILE_ID" \
      -d "{
        \"name\": \"sleep_pattern\",
        \"value\": \"$SLEEP\",
        \"dataType\": \"ordinal\"
      }" -s > /dev/null
    
    # Create mental wellness archetype
    curl -X POST http://localhost:3000/api/sahha/webhook \
      -H "Content-Type: application/json" \
      -H "X-Event-Type: ArchetypeCreatedIntegrationEvent" \
      -H "X-External-Id: $PROFILE_ID" \
      -d "{
        \"name\": \"mental_wellness\",
        \"value\": \"$MENTAL\",
        \"dataType\": \"ordinal\"
      }" -s > /dev/null
    
    # Create some biomarkers
    HR=$((60 + RANDOM % 40))
    curl -X POST http://localhost:3000/api/sahha/webhook \
      -H "Content-Type: application/json" \
      -H "X-Event-Type: BiomarkerCreatedIntegrationEvent" \
      -H "X-External-Id: $PROFILE_ID" \
      -d "{
        \"category\": \"heart\",
        \"type\": \"resting_heart_rate\",
        \"value\": $HR,
        \"unit\": \"bpm\",
        \"periodicity\": \"daily\",
        \"aggregation\": \"average\"
      }" -s > /dev/null
    
    STEPS=$((3000 + RANDOM % 12000))
    curl -X POST http://localhost:3000/api/sahha/webhook \
      -H "Content-Type: application/json" \
      -H "X-Event-Type: BiomarkerCreatedIntegrationEvent" \
      -H "X-External-Id: $PROFILE_ID" \
      -d "{
        \"category\": \"activity\",
        \"type\": \"steps\",
        \"value\": $STEPS,
        \"unit\": \"count\",
        \"periodicity\": \"daily\",
        \"aggregation\": \"sum\"
      }" -s > /dev/null
    
    echo "  ✅ Scores: W:$WELLBEING_SCORE A:$ACTIVITY_SCORE S:$SLEEP_SCORE M:$MENTAL_SCORE"
    echo "  ✅ Archetypes: Activity:$ARCHETYPE Sleep:$SLEEP Mental:$MENTAL"
    echo "  ✅ Biomarkers: HR:${HR}bpm Steps:$STEPS"
done

echo
echo "============================================"
echo "📊 Summary of created profiles:"
echo

curl -s http://localhost:3000/api/sahha/webhook | jq '{
  totalProfiles: .count,
  departments: .stats.departmentBreakdown,
  recentProfiles: .profiles[-5:] | map({
    id: .externalId,
    dept: .department,
    scores: .scores | to_entries | map("\(.key):\(.value.value | tostring[0:4])") | join(", "),
    archetypes: .archetypes | keys | length
  })
}'

echo
echo "✅ All test events created successfully\!"
