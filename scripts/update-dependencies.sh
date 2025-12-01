#!/bin/bash

# Dependency Management Script for sprouting-academy-back
# Usage: ./scripts/update-dependencies.sh [security|outdated|all]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Dependency Management Script${NC}"
echo -e "${BLUE}=================================${NC}"
echo

# Function to check security vulnerabilities
check_security() {
    echo -e "${YELLOW}🔒 Checking for security vulnerabilities...${NC}"
    
    if npm audit --audit-level=high; then
        echo -e "${GREEN}✅ No high/critical security vulnerabilities found${NC}"
        return 0
    else
        echo -e "${RED}⚠️ Security vulnerabilities detected!${NC}"
        echo -e "${YELLOW}Run 'npm audit fix' to attempt automatic fixes${NC}"
        return 1
    fi
}

# Function to check outdated packages
check_outdated() {
    echo -e "${YELLOW}📦 Checking for outdated packages...${NC}"
    
    if npm outdated; then
        echo -e "${GREEN}✅ All packages are up to date${NC}"
        return 0
    else
        echo -e "${YELLOW}📦 Some packages are outdated${NC}"
        echo -e "${YELLOW}Run 'npm update' to update compatible versions${NC}"
        return 1
    fi
}

# Function to fix security issues
fix_security() {
    echo -e "${YELLOW}🔧 Attempting to fix security vulnerabilities...${NC}"
    
    if npm audit fix; then
        echo -e "${GREEN}✅ Security fixes applied successfully${NC}"
    else
        echo -e "${YELLOW}⚠️ Some security issues require manual intervention${NC}"
        echo -e "${YELLOW}Check 'npm audit' output for details${NC}"
    fi
}

# Function to update outdated packages
update_outdated() {
    echo -e "${YELLOW}🔄 Updating compatible package versions...${NC}"
    
    if npm update; then
        echo -e "${GREEN}✅ Packages updated successfully${NC}"
        echo -e "${YELLOW}Remember to test your application after updates${NC}"
    else
        echo -e "${RED}❌ Package update failed${NC}"
        return 1
    fi
}

# Function to run tests
run_tests() {
    echo -e "${YELLOW}🧪 Running tests to ensure compatibility...${NC}"
    
    if npm test; then
        echo -e "${GREEN}✅ All tests passed${NC}"
    else
        echo -e "${RED}❌ Tests failed after dependency updates${NC}"
        echo -e "${YELLOW}You may need to fix compatibility issues${NC}"
        return 1
    fi
}

# Main execution
case "$1" in
    "security")
        echo -e "${BLUE}Running security-only checks...${NC}"
        check_security
        ;;
    "outdated")
        echo -e "${BLUE}Running outdated package checks...${NC}"
        check_outdated
        ;;
    "fix-security")
        echo -e "${BLUE}Fixing security vulnerabilities...${NC}"
        fix_security
        run_tests
        ;;
    "update")
        echo -e "${BLUE}Updating outdated packages...${NC}"
        update_outdated
        run_tests
        ;;
    "all")
        echo -e "${BLUE}Running comprehensive dependency check and update...${NC}"
        
        # Check current status
        SECURITY_ISSUES=0
        OUTDATED_ISSUES=0
        
        check_security || SECURITY_ISSUES=1
        echo
        check_outdated || OUTDATED_ISSUES=1
        echo
        
        # Ask for confirmation if issues found
        if [ $SECURITY_ISSUES -eq 1 ] || [ $OUTDATED_ISSUES -eq 1 ]; then
            echo -e "${YELLOW}Issues found. Would you like to attempt fixes? (y/N)${NC}"
            read -r CONFIRM
            
            if [[ $CONFIRM =~ ^[Yy]$ ]]; then
                if [ $SECURITY_ISSUES -eq 1 ]; then
                    fix_security
                    echo
                fi
                
                if [ $OUTDATED_ISSUES -eq 1 ]; then
                    update_outdated
                    echo
                fi
                
                run_tests
            else
                echo -e "${YELLOW}Skipping automatic fixes${NC}"
            fi
        fi
        ;;
    *)
        echo -e "${YELLOW}Usage: $0 [security|outdated|fix-security|update|all]${NC}"
        echo
        echo -e "${YELLOW}Commands:${NC}"
        echo -e "  security     - Check for security vulnerabilities only"
        echo -e "  outdated     - Check for outdated packages only"
        echo -e "  fix-security - Fix security vulnerabilities and run tests"
        echo -e "  update       - Update outdated packages and run tests"
        echo -e "  all          - Check everything and optionally fix issues"
        echo
        exit 1
        ;;
esac

echo
echo -e "${GREEN}🎉 Dependency management complete!${NC}"