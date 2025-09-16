#\!/bin/bash

echo "🧪 Testing Multiple Sahha Scores per Profile"
echo "============================================"
echo

# Create 10 profiles with full scores and archetypes
for i in {1..10}; do
    PROFILE_ID="SAHHA-USER-$(printf "%03d" $i)"
    
    # Randomly assign department
    DEPT_INDEX=$((RANDOM % 5))
    case $DEPT_INDEX in
        0) DEPT="tech" ;;
        1) DEPT="sales" ;;
        2) DEPT="operations" ;;
        3) DEPT="admin" ;;
        *) DEPT="unassigned" ;;
    esac
    
    echo "📝 Creating comprehensive profile: $PROFILE_ID (Dept: $DEPT)"
    
    # Generate correlated scores (they influence each other)
    BASE_HEALTH=$((40 + RANDOM % 40))  # Base between 40-80
    
    # All scores with realistic correlation
    WELLBEING=$((BASE_HEALTH + (RANDOM % 20) - 10))
    ACTIVITY=$((BASE_HEALTH + (RANDOM % 30) - 15))
    SLEEP=$((BASE_HEALTH + (RANDOM % 25) - 12))
    MENTAL=$((BASE_HEALTH + (RANDOM % 20) - 10))
    READINESS=$((BASE_HEALTH + (RANDOM % 15) - 7))
    
    # Ensure scores are in valid range
    WELLBEING=$((WELLBEING < 0 ? 0 : (WELLBEING > 100 ? 100 : WELLBEING)))
    ACTIVITY=$((ACTIVITY < 0 ? 0 : (ACTIVITY > 100 ? 100 : ACTIVITY)))
    SLEEP=$((SLEEP < 0 ? 0 : (SLEEP > 100 ? 100 : SLEEP)))
    MENTAL=$((MENTAL < 0 ? 0 : (MENTAL > 100 ? 100 : MENTAL)))
    READINESS=$((READINESS < 0 ? 0 : (READINESS > 100 ? 100 : READINESS)))
    
    # Send all scores
    for SCORE_TYPE in wellbeing activity sleep mentalWellbeing readiness; do
        case $SCORE_TYPE in
            wellbeing) SCORE=$WELLBEING ;;
            activity) SCORE=$ACTIVITY ;;
            sleep) SCORE=$SLEEP ;;
            mentalWellbeing) SCORE=$MENTAL ;;
            readiness) SCORE=$READINESS ;;
        esac
        
        STATE="moderate"
        [ $SCORE -gt 75 ] && STATE="excellent"
        [ $SCORE -gt 60 ] && [ $SCORE -le 75 ] && STATE="good"
        [ $SCORE -le 40 ] && STATE="poor"
        
        curl -X POST http://localhost:3000/api/sahha/webhook \
          -H "Content-Type: application/json" \
          -H "X-Event-Type: ScoreCreatedIntegrationEvent" \
          -H "X-External-Id: $PROFILE_ID" \
          -d "{
            \"type\": \"$SCORE_TYPE\",
            \"score\": $SCORE,
            \"state\": \"$STATE\",
            \"department\": \"$DEPT\",
            \"scoreDateTime\": \"$(date -Iseconds)\"
          }" -s > /dev/null
    done
    
    # Send comprehensive archetypes based on scores
    # Activity level based on activity score
    ACTIVITY_LEVEL="sedentary"
    [ $ACTIVITY -gt 30 ] && ACTIVITY_LEVEL="lightly_active"
    [ $ACTIVITY -gt 50 ] && ACTIVITY_LEVEL="moderately_active"
    [ $ACTIVITY -gt 70 ] && ACTIVITY_LEVEL="highly_active"
    [ $ACTIVITY -gt 85 ] && ACTIVITY_LEVEL="very_active"
    
    # Sleep pattern based on sleep score
    SLEEP_PATTERN="poor_sleeper"
    [ $SLEEP -gt 40 ] && SLEEP_PATTERN="fair_sleeper"
    [ $SLEEP -gt 60 ] && SLEEP_PATTERN="good_sleeper"
    [ $SLEEP -gt 80 ] && SLEEP_PATTERN="excellent_sleeper"
    
    # Mental wellness based on mental score
    MENTAL_WELLNESS="poor_mental_wellness"
    [ $MENTAL -gt 40 ] && MENTAL_WELLNESS="fair_mental_wellness"
    [ $MENTAL -gt 60 ] && MENTAL_WELLNESS="good_mental_wellness"
    [ $MENTAL -gt 80 ] && MENTAL_WELLNESS="optimal_mental_wellness"
    
    # Overall wellness based on wellbeing
    OVERALL_WELLNESS="poor"
    [ $WELLBEING -gt 40 ] && OVERALL_WELLNESS="fair"
    [ $WELLBEING -gt 60 ] && OVERALL_WELLNESS="good"
    [ $WELLBEING -gt 80 ] && OVERALL_WELLNESS="optimal"
    
    # Send all archetypes
    ARCHETYPES=(
        "activity_level:$ACTIVITY_LEVEL"
        "sleep_pattern:$SLEEP_PATTERN"
        "sleep_quality:$SLEEP_PATTERN"
        "mental_wellness:$MENTAL_WELLNESS"
        "overall_wellness:$OVERALL_WELLNESS"
        "exercise_frequency:$([ $ACTIVITY -gt 60 ] && echo 'regular_exerciser' || echo 'occasional_exerciser')"
        "sleep_duration:$([ $SLEEP -gt 60 ] && echo 'optimal' || echo 'short')"
    )
    
    for ARCHETYPE in "${ARCHETYPES[@]}"; do
        NAME="${ARCHETYPE%%:*}"
        VALUE="${ARCHETYPE##*:}"
        
        curl -X POST http://localhost:3000/api/sahha/webhook \
          -H "Content-Type: application/json" \
          -H "X-Event-Type: ArchetypeCreatedIntegrationEvent" \
          -H "X-External-Id: $PROFILE_ID" \
          -d "{
            \"name\": \"$NAME\",
            \"value\": \"$VALUE\",
            \"dataType\": \"ordinal\",
            \"ordinality\": 1,
            \"periodicity\": \"daily\"
          }" -s > /dev/null
    done
    
    echo "  ✅ Scores: W:$WELLBEING A:$ACTIVITY S:$SLEEP M:$MENTAL R:$READINESS"
    echo "  ✅ Archetypes: Activity:$ACTIVITY_LEVEL Sleep:$SLEEP_PATTERN Mental:$MENTAL_WELLNESS"
done

echo
echo "============================================"
echo "📊 Final webhook data summary:"
echo

curl -s http://localhost:3000/api/sahha/webhook | jq '{
  totalProfiles: .count,
  departments: .stats.departmentBreakdown,
  profilesWithAllScores: [.profiles[] | select(.scores.wellbeing and .scores.activity and .scores.sleep)] | length,
  profilesWithArchetypes: [.profiles[] | select(.archetypes | length > 0)] | length,
  sampleProfile: .profiles[-1] | {
    id: .externalId,
    dept: .department,
    scoreCount: .scores | length,
    archetypeCount: .archetypes | length,
    scores: .scores | to_entries | map("\(.key): \(.value.value | tostring[0:5])") | join(", ")
  }
}'

echo
echo "✅ Comprehensive webhook data created\!"
